const TelegramBot = require('node-telegram-bot-api');
const db = require('../models');

let botInstance = null;

// Function to start the bot
const startBot = (token) => {
    if (!token) return;

    // Stop existing instance if any
    if (botInstance) {
        botInstance.stopPolling();
        botInstance = null;
    }

    try {
        botInstance = new TelegramBot(token, { polling: true });
        console.log("Telegram bot started with polling.");

        // Handle /start command
        botInstance.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const telegramId = msg.from.id.toString();
            const username = msg.from.username || '';

            try {
                // Find or create registration session
                let [registration, created] = await db.BotRegistration.findOrCreate({
                    where: { telegram_id: telegramId },
                    defaults: {
                        chat_id: chatId.toString(),
                        username: username,
                        step: 'AWAITING_NAME',
                        status: 'PENDING'
                    }
                });

                if (!created) {
                    // Reset if already exists but wants to restart
                    await registration.update({
                        step: 'AWAITING_NAME',
                        status: 'PENDING',
                        username: username, // update username in case it changed
                        full_name: null,
                        age: null,
                        phone_number: null,
                        interest: null,
                        address: null,
                        school: null
                    });
                }

                botInstance.sendMessage(chatId, "Assalomu alaykum! Quva tumani Politexnikumi ro'yxatdan o'tish botiga xush kelibsiz.\n\nIltimos, to'liq ism-familiyangizni kiriting:");
            } catch (err) {
                console.error("Bot DB error:", err);
            }
        });

        // Handle incoming messages for the state machine
        botInstance.on('message', async (msg) => {
            if (msg.text === '/start') return; // Handled above

            const chatId = msg.chat.id;
            const telegramId = msg.from.id.toString();
            const text = msg.text || '';

            try {
                const registration = await db.BotRegistration.findOne({ where: { telegram_id: telegramId } });
                
                if (!registration || registration.status === 'COMPLETED') {
                    // If no active registration, ask to type /start
                    return botInstance.sendMessage(chatId, "Ro'yxatdan o'tishni boshlash uchun /start buyrug'ini bosing.");
                }

                switch (registration.step) {
                    case 'AWAITING_NAME':
                        await registration.update({ full_name: text, step: 'AWAITING_AGE' });
                        botInstance.sendMessage(chatId, "Yaxshi. Yoshingiz nechchida?");
                        break;

                    case 'AWAITING_AGE':
                        await registration.update({ age: text, step: 'AWAITING_PHONE' });
                        botInstance.sendMessage(chatId, "Qabul qilindi. Endi telefon raqamingizni kiriting (masalan: +998901234567):");
                        break;
                    
                    case 'AWAITING_PHONE':
                        await registration.update({ phone_number: text, step: 'AWAITING_ADDRESS' });
                        
                        // Fetch the address example from settings
                        const addressSetting = await db.SiteSetting.findOne({ where: { key: 'bot_address_example' } });
                        const addressExample = (addressSetting && addressSetting.value) ? addressSetting.value : "Farg'ona viloyati, Quva tumani";
                        
                        botInstance.sendMessage(chatId, `Yashash joyingizni kiriting\n(${addressExample}):`);
                        break;

                    case 'AWAITING_ADDRESS':
                        await registration.update({ address: text, step: 'AWAITING_SCHOOL' });
                        botInstance.sendMessage(chatId, "Hozirda qaysi maktab/o'quv yurtida o'qiysiz? Yoki ishlaysizmi?");
                        break;

                    case 'AWAITING_SCHOOL':
                        await registration.update({ school: text, step: 'AWAITING_INTEREST' });
                        
                        // Fetch available fields (sohalar) from database
                        const fields = await db.Field.findAll();
                        
                        // Create keyboard layout
                        const keyboard = [];
                        let currentRow = [];
                        
                        fields.forEach((field, index) => {
                            currentRow.push({ text: field.title_uz || field.title_ru || field.title_en });
                            if (currentRow.length === 2 || index === fields.length - 1) {
                                keyboard.push(currentRow);
                                currentRow = [];
                            }
                        });
                        
                        keyboard.push([{ text: "Boshqa" }]); // Add "Other" button at the end

                        botInstance.sendMessage(chatId, "Qaysi yo'nalishga (kasbga) qiziqasiz? Quyidagilardan birini tanlang yoki 'Boshqa' ni bosing:", {
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true,
                                one_time_keyboard: true
                            }
                        });
                        break;

                    case 'AWAITING_INTEREST':
                        if (text === 'Boshqa') {
                            await registration.update({ step: 'AWAITING_CUSTOM_INTEREST' });
                            botInstance.sendMessage(chatId, "Siz qaysi sohaga qiziqasiz? Matn shaklida yozib yuboring:", {
                                reply_markup: { remove_keyboard: true }
                            });
                        } else {
                            // User selected an option from the keyboard
                            await registration.update({ interest: text, step: 'COMPLETED', status: 'COMPLETED' });
                            botInstance.sendMessage(chatId, "🎉 Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Ma'lumotlaringiz qabul qilindi. Biz siz bilan tez orada bog'lanamiz.", {
                                reply_markup: { remove_keyboard: true }
                            });
                        }
                        break;

                    case 'AWAITING_CUSTOM_INTEREST':
                        await registration.update({ interest: text, step: 'COMPLETED', status: 'COMPLETED' });
                        botInstance.sendMessage(chatId, "🎉 Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Ma'lumotlaringiz qabul qilindi. Biz siz bilan tez orada bog'lanamiz.", {
                            reply_markup: { remove_keyboard: true }
                        });
                        break;
                }
            } catch (err) {
                console.error("Bot state machine error:", err);
            }
        });

    } catch (error) {
        console.error("Failed to start Telegram bot:", error.message);
    }
};

const stopBot = () => {
    if (botInstance) {
        botInstance.stopPolling();
        botInstance = null;
        console.log("Telegram bot stopped.");
    }
};

const isRunning = () => {
    return botInstance !== null;
};

module.exports = { startBot, stopBot, isRunning };
