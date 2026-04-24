const db = require('../models');
const botManager = require('../bot/index');

exports.getBotStatus = async (req, res) => {
    try {
        const tokenSetting = await db.SiteSetting.findOne({ where: { key: 'bot_token' } });
        const addressExampleSetting = await db.SiteSetting.findOne({ where: { key: 'bot_address_example' } });
        
        const token = tokenSetting ? tokenSetting.value : '';
        const addressExample = addressExampleSetting ? addressExampleSetting.value : '';
        const isRunning = botManager.isRunning();

        res.json({ token, addressExample, isRunning });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBotToken = async (req, res) => {
    try {
        const { token, addressExample } = req.body;

        // Save to SiteSetting
        await db.SiteSetting.upsert({
            key: 'bot_token',
            value: token,
            type: 'text'
        });

        if (addressExample !== undefined) {
            await db.SiteSetting.upsert({
                key: 'bot_address_example',
                value: addressExample,
                type: 'text'
            });
        }

        // Stop current bot if running
        botManager.stopBot();

        // Start new bot if token is provided
        if (token && token.trim() !== '') {
            botManager.startBot(token.trim());
        }

        res.json({ message: 'Bot holati yangilandi', isRunning: botManager.isRunning() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRegistrations = async (req, res) => {
    try {
        const registrations = await db.BotRegistration.findAll({
            order: [['updatedAt', 'DESC']]
        });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRegistration = async (req, res) => {
    try {
        await db.BotRegistration.destroy({ where: { id: req.params.id } });
        res.json({ message: "O'chirildi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
