const TelegramBot = require('node-telegram-bot-api');
const db = require('../models');

let bot = null;

const getCabinetKeyboard = (isRegistered) => {
    return {
        reply_markup: {
            keyboard: [
                isRegistered ? [{ text: "👤 Profilim" }] : [{ text: "📝 Ro'yxatdan o'tish" }],
                [{ text: "📚 Kurslar haqida" }, { text: "📰 Yangiliklar" }],
                [{ text: "🌐 Saytni ko'rish" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
};

const createApplicationRecord = async (reg) => {
    try {
        let appDob = null;
        if (reg.dob) {
            const parsed = Date.parse(reg.dob);
            if (!isNaN(parsed)) {
                appDob = new Date(parsed).toISOString().split('T')[0];
            } else if (/^\d{4}$/.test(reg.dob.trim())) {
                appDob = `${reg.dob.trim()}-01-01`;
            }
        }

        await db.Application.create({
            fullName: reg.fullName || reg.firstName || "Noma'lum",
            phone: reg.phone || "Noma'lum",
            dob: appDob,
            passport: reg.passport || "",
            address: reg.address || "",
            education: reg.education || "",
            fieldId: reg.fieldId,
            message: "Telegram bot orqali ro'yxatdan o'tgan a'zo",
            status: 'new'
        });
    } catch (e) {
        console.error("Failed to create application record from bot registration:", e);
    }
};

const startBot = async (token) => {
    if (bot) {
        try { await bot.stopPolling(); } catch (e) {}
        bot = null;
    }

    // Create bot, clear any pending updates / webhook before polling
    const TelegramBotClass = TelegramBot;
    bot = new TelegramBotClass(token, { polling: false });

    try {
        await bot.deleteWebHook({ drop_pending_updates: true });
    } catch (e) {
        console.error('Could not delete webhook:', e.message);
    }

    // Now start polling cleanly
    bot.startPolling({ restart: false });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const contact = msg.contact;
        const { first_name, username } = msg.from;

        try {
            const [registration, created] = await db.BotRegistration.findOrCreate({
                where: { chatId: chatId.toString() },
                defaults: {
                    firstName: first_name,
                    username: username,
                    status: 'active',
                    step: 'idle',
                    isRegistered: false
                }
            });

            if (!created && registration.status !== 'active') {
                await registration.update({ status: 'active' });
            }

            // If we are in registration wizard
            if (registration.step && registration.step !== 'idle') {
                if (text === '❌ Bekor qilish') {
                    await registration.update({ step: 'idle' });
                    return bot.sendMessage(chatId, "Ro'yxatdan o'tish bekor qilindi.", getCabinetKeyboard(registration.isRegistered));
                }

                if (registration.step === 'enter_fullname') {
                    if (!text || text.trim().length < 3) {
                        return bot.sendMessage(chatId, "Iltimos, to'liq ism-sharifingizni (F.I.SH) kiriting:");
                    }
                    await registration.update({ fullName: text.trim(), step: 'enter_phone' });
                    return bot.sendMessage(chatId, "Telefon raqamingizni kiriting yoki quyidagi tugma orqali ulashing:", {
                        reply_markup: {
                            keyboard: [
                                [{ text: "📱 Kontaktni yuborish", request_contact: true }],
                                [{ text: "❌ Bekor qilish" }]
                            ],
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'enter_phone') {
                    let phone = '';
                    if (contact && contact.phone_number) {
                        phone = contact.phone_number;
                    } else if (text) {
                        phone = text.trim();
                    } else {
                        return bot.sendMessage(chatId, "Iltimos, telefon raqamingizni kiriting yoki kontakt yuboring:");
                    }
                    await registration.update({ phone, step: 'enter_dob' });
                    return bot.sendMessage(chatId, "Tug'ilgan yilingiz va kuningizni kiriting (masalan: 2005-08-15 yoki 2005 yil):", {
                        reply_markup: {
                            keyboard: [[{ text: "❌ Bekor qilish" }]],
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'enter_dob') {
                    if (!text) return bot.sendMessage(chatId, "Iltimos, tug'ilgan yilingizni yozing:");
                    await registration.update({ dob: text.trim(), step: 'enter_passport' });
                    return bot.sendMessage(chatId, "Pasport seriyasi va raqamini kiriting (masalan: AD1234567):", {
                        reply_markup: {
                            keyboard: [[{ text: "❌ Bekor qilish" }]],
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'enter_passport') {
                    if (!text) return bot.sendMessage(chatId, "Iltimos, pasport ma'lumotlaringizni kiriting:");
                    await registration.update({ passport: text.trim(), step: 'enter_address' });
                    return bot.sendMessage(chatId, "Yashash manzilingizni kiriting (masalan: Farg'ona viloyati, Quva tumani):", {
                        reply_markup: {
                            keyboard: [[{ text: "❌ Bekor qilish" }]],
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'enter_address') {
                    if (!text) return bot.sendMessage(chatId, "Iltimos, manzilingizni kiriting:");
                    await registration.update({ address: text.trim(), step: 'enter_education' });
                    return bot.sendMessage(chatId, "Ma'lumotingizni kiriting (masalan: O'rta maxsus, 11-sinf, Oliy):", {
                        reply_markup: {
                            keyboard: [[{ text: "❌ Bekor qilish" }]],
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'enter_education') {
                    if (!text) return bot.sendMessage(chatId, "Iltimos, ma'lumotingizni kiriting:");
                    await registration.update({ education: text.trim(), step: 'select_field' });
                    
                    const fields = await db.Field.findAll({ order: [['order', 'ASC']] });
                    if (!fields || fields.length === 0) {
                        await registration.update({ isRegistered: true, step: 'idle' });
                        await createApplicationRecord(registration);
                        return bot.sendMessage(chatId, "Muvaffaqiyatli ro'yxatdan o'tdingiz!", getCabinetKeyboard(true));
                    }

                    const courseButtons = fields.map(f => [{ text: f.title_uz }]);
                    courseButtons.push([{ text: "❌ Bekor qilish" }]);

                    return bot.sendMessage(chatId, "Qaysi yo'nalish (kurs) bo'yicha ta'lim olmoqchisiz? Quyidagilardan birini tanlang:", {
                        reply_markup: {
                            keyboard: courseButtons,
                            resize_keyboard: true
                        }
                    });
                }

                if (registration.step === 'select_field') {
                    if (!text) return bot.sendMessage(chatId, "Iltimos, yo'nalishlardan birini tanlang:");
                    const field = await db.Field.findOne({ where: { title_uz: text.trim() } });
                    if (!field) {
                        return bot.sendMessage(chatId, "Noto'g'ri yo'nalish tanlandi. Iltimos, quyidagi ro'yxatdan tanlang:");
                    }

                    await registration.update({
                        fieldId: field.id,
                        isRegistered: true,
                        step: 'idle'
                    });

                    await createApplicationRecord(registration);

                    return bot.sendMessage(chatId, `Muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nSiz tanlagan yo'nalish: ${field.title_uz}\nTez orada operatorlarimiz siz bilan bog'lanishadi.`, getCabinetKeyboard(true));
                }
            }

            // Normal Commands
            if (text === '/start') {
                const welcomeSetting = await db.SiteSetting.findOne({ where: { key: 'bot_welcome_message' } });
                const welcomeMsg = welcomeSetting ? welcomeSetting.value : "Quva Politexnikumi Botiga xush kelibsiz! Bu yerda ro'yxatdan o'tishingiz, yangiliklar va kurslar haqida ma'lumot olishingiz mumkin.";
                return bot.sendMessage(chatId, welcomeMsg, getCabinetKeyboard(registration.isRegistered));
            }

            if (text === '📝 Ro\'yxatdan o\'tish') {
                if (registration.isRegistered) {
                    return bot.sendMessage(chatId, "Siz allaqachon ro'yxatdan o'tgansiz.", getCabinetKeyboard(true));
                }
                await registration.update({ step: 'enter_fullname' });
                return bot.sendMessage(chatId, "Keling, ro'yxatdan o'tishni boshlaymiz.\n\nTo'liq ismingizni (F.I.SH) kiriting:", {
                    reply_markup: {
                        keyboard: [[{ text: "❌ Bekor qilish" }]],
                        resize_keyboard: true
                    }
                });
            }

            if (text === '👤 Profilim') {
                if (!registration.isRegistered) {
                    return bot.sendMessage(chatId, "Siz hali ro'yxatdan o'tmagansiz.", getCabinetKeyboard(false));
                }
                const field = registration.fieldId ? await db.Field.findByPk(registration.fieldId) : null;
                const fieldTitle = field ? field.title_uz : "Tanlanmagan";
                const profileText = `👤 *Sizning Profilingiz*:\n\n` +
                                   `✍️ *F.I.SH:* ${registration.fullName}\n` +
                                   `📞 *Telefon:* ${registration.phone}\n` +
                                   `📅 *Tug'ilgan sana:* ${registration.dob}\n` +
                                   `🪪 *Pasport:* ${registration.passport}\n` +
                                   `🏠 *Manzil:* ${registration.address}\n` +
                                   `🏠 *Ma'lumoti:* ${registration.education}\n` +
                                   `📚 *Tanlangan yo'nalish:* ${fieldTitle}`;
                return bot.sendMessage(chatId, profileText, { parse_mode: 'Markdown' });
            }

            if (text === '📚 Kurslar haqida') {
                const fields = await db.Field.findAll({ order: [['order', 'ASC']] });
                if (!fields || fields.length === 0) {
                    return bot.sendMessage(chatId, "Hozircha yo'nalishlar mavjud emas.");
                }
                const inline_keyboard = fields.map(f => [{ text: f.title_uz, callback_data: `course_${f.id}` }]);
                return bot.sendMessage(chatId, "Bizning yo'nalishlarimiz (kurslar) ro'yxati. Batafsil ma'lumot olish uchun ustiga bosing:", {
                    reply_markup: { inline_keyboard }
                });
            }

            if (text === '📰 Yangiliklar') {
                const newsList = await db.News.findAll({ 
                    order: [['createdAt', 'DESC']], 
                    limit: 3, 
                    include: [{ model: db.NewsMedia, as: 'media' }] 
                });
                
                if (!newsList || newsList.length === 0) {
                    return bot.sendMessage(chatId, "Hozircha yangiliklar mavjud emas.");
                }

                for (const news of newsList) {
                    const cleanContent = news.content_uz.replace(/<[^>]*>/g, '');
                    const snippet = cleanContent.length > 300 ? cleanContent.substring(0, 300) + '...' : cleanContent;
                    const textToSend = `📰 *${news.title_uz}*\n\n${snippet}`;
                    
                    if (news.media && news.media.length > 0) {
                        const firstMedia = news.media[0];
                        const fullPath = firstMedia.url.startsWith('http') 
                            ? firstMedia.url 
                            : `http://localhost:3000${firstMedia.url}`;
                        try {
                            await bot.sendPhoto(chatId, fullPath, { caption: textToSend, parse_mode: 'Markdown' });
                        } catch (e) {
                            await bot.sendMessage(chatId, textToSend, { parse_mode: 'Markdown' });
                        }
                    } else {
                        await bot.sendMessage(chatId, textToSend, { parse_mode: 'Markdown' });
                    }
                }
                return;
            }

            if (text === '🌐 Saytni ko\'rish') {
                return bot.sendMessage(chatId, "Texnikum rasmiy veb-saytiga o'ting:", {
                    reply_markup: {
                        inline_keyboard: [[{ text: "🌐 Saytni ochish", url: "http://localhost:3000" }]]
                    }
                });
            }

            if (text === '/stop') {
                await registration.update({ status: 'inactive' });
                return bot.sendMessage(chatId, "Siz bildirishnomalardan voz kechdingiz.");
            }

        } catch (error) {
            console.error("Bot error:", error);
            bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos keyinroq urunib ko'ring.");
        }
    });

    // Callback query for course selection details
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
        if (data.startsWith('course_')) {
            const id = data.split('_')[1];
            try {
                const field = await db.Field.findByPk(id);
                if (field) {
                    const cleanDesc = field.description_uz.replace(/<[^>]*>/g, '');
                    const text = `📚 *${field.title_uz}*\n\n${cleanDesc}`;
                    if (field.image_url) {
                        const fullPath = field.image_url.startsWith('http') 
                            ? field.image_url 
                            : `http://localhost:3000${field.image_url}`;
                        try {
                            await bot.sendPhoto(chatId, fullPath, { caption: text, parse_mode: 'Markdown' });
                        } catch (e) {
                            await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
                        }
                    } else {
                        await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
                    }
                }
            } catch (e) {
                console.error("Error sending course details callback:", e);
            }
        }
    });

    console.log("Telegram Bot started");
};

const sendNotification = async (message, mediaPath = null, mimeType = null) => {
    if (!bot) {
        console.log("Bot is not running, cannot send notification.");
        return false;
    }
    try {
        const activeUsers = await db.BotRegistration.findAll({ where: { status: 'active' } });
        for (const user of activeUsers) {
            try {
                if (mediaPath) {
                    if (mimeType && mimeType.startsWith('video/')) {
                        await bot.sendVideo(user.chatId, mediaPath, { caption: message });
                    } else {
                        await bot.sendPhoto(user.chatId, mediaPath, { caption: message });
                    }
                } else {
                    await bot.sendMessage(user.chatId, message);
                }
            } catch (e) {
                console.error(`Failed to send message to ${user.chatId}:`, e.message);
                if (e.message.includes('bot was blocked by the user')) {
                    await user.update({ status: 'inactive' });
                }
            }
        }
        return true;
    } catch (error) {
        console.error("Send notification error:", error);
        return false;
    }
};

const sendMessageToUser = async (chatId, message, mediaPath = null, mimeType = null) => {
    if (!bot) {
        throw new Error("Telegram bot ishga tushmagan yoki to'xtatilgan.");
    }
    if (mediaPath) {
        if (mimeType && mimeType.startsWith('video/')) {
            await bot.sendVideo(chatId, mediaPath, { caption: message });
        } else {
            await bot.sendPhoto(chatId, mediaPath, { caption: message });
        }
    } else {
        await bot.sendMessage(chatId, message);
    }
    return true;
};

const stopBot = () => {
    if (bot) {
        bot.stopPolling();
        bot = null;
        console.log("Telegram Bot stopped");
    }
};

const getStatus = () => {
    return bot !== null;
};

module.exports = {
    startBot,
    stopBot,
    getStatus,
    sendNotification,
    sendMessageToUser
};
