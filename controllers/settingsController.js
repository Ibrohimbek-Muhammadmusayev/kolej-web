const db = require('../models');

module.exports = {
    async getSettings(req, res) {
        try {
            const settings = await db.SiteSetting.findAll();
            // Convert to key-value object for easier frontend consumption
            const settingsMap = {};
            settings.forEach(s => {
                settingsMap[s.key] = s.value;
            });
            res.json(settingsMap);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateSettings(req, res) {
        try {
            const updates = req.body; // Expect { key: value, key2: value2 }
            const keys = Object.keys(updates);

            for (const key of keys) {
                await db.SiteSetting.upsert({
                    key,
                    value: updates[key],
                    type: 'text' // Defaulting to text for now
                });
            }

            res.json({ message: 'Settings updated' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
