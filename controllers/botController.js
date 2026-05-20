const db = require('../models');
const botManager = require('../bot/index');

exports.getBotStatus = async (req, res) => {
    try {
        const tokenSetting = await db.SiteSetting.findOne({ where: { key: 'bot_token' } });
        const welcomeSetting = await db.SiteSetting.findOne({ where: { key: 'bot_welcome_message' } });
        res.json({
            isActive: botManager.getStatus(),
            hasToken: !!(tokenSetting && tokenSetting.value),
            token: tokenSetting ? tokenSetting.value : '',
            welcomeMessage: welcomeSetting ? welcomeSetting.value : ''
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBotToken = async (req, res) => {
    try {
        const { token, welcomeMessage } = req.body;

        if (token !== undefined) {
            let tokenSetting = await db.SiteSetting.findOne({ where: { key: 'bot_token' } });
            if (tokenSetting) {
                await tokenSetting.update({ value: token });
            } else {
                await db.SiteSetting.create({ key: 'bot_token', value: token });
            }
            // Restart bot with new token
            botManager.startBot(token);
        }

        if (welcomeMessage !== undefined) {
            let welcomeSetting = await db.SiteSetting.findOne({ where: { key: 'bot_welcome_message' } });
            if (welcomeSetting) {
                await welcomeSetting.update({ value: welcomeMessage });
            } else {
                await db.SiteSetting.create({ key: 'bot_welcome_message', value: welcomeMessage });
            }
        }

        res.json({ message: 'Bot settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRegistrations = async (req, res) => {
    try {
        // This assumes a BotRegistration model exists
        if (db.BotRegistration) {
            const registrations = await db.BotRegistration.findAll();
            res.json(registrations);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRegistration = async (req, res) => {
    try {
        if (db.BotRegistration) {
            await db.BotRegistration.destroy({ where: { id: req.params.id } });
            res.json({ message: 'Registration deleted' });
        } else {
            res.status(404).json({ message: 'Model not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendBroadcast = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const mediaPath = req.file ? req.file.path : null;
        const mimeType = req.file ? req.file.mimetype : null;

        const success = await botManager.sendNotification(message, mediaPath, mimeType);
        if (success) {
            res.json({ message: 'Broadcast message sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send broadcast. Make sure the bot is running.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendSingleMessage = async (req, res) => {
    try {
        const { chatId, message } = req.body;
        if (!chatId) return res.status(400).json({ message: 'chatId is required' });
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const mediaPath = req.file ? req.file.path : null;
        const mimeType = req.file ? req.file.mimetype : null;

        await botManager.sendMessageToUser(chatId, message, mediaPath, mimeType);
        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error("sendSingleMessage error:", error.message);
        res.status(500).json({ message: `Xabarni yuborib bo'lmadi: ${error.message}` });
    }
};
