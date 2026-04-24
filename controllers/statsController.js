const db = require('../models');

module.exports = {
    async getAllStats(req, res) {
        try {
            let stats = await db.Statistic.findAll({ order: [['order', 'ASC']] });
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async createStat(req, res) {
        try {
            const stat = await db.Statistic.create(req.body);
            res.status(201).json(stat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateStats(req, res) {
        try {
            const updates = req.body;
            if (Array.isArray(updates)) {
                for (const update of updates) {
                    if (update.id) {
                        await db.Statistic.update(update, { where: { id: update.id } });
                    }
                }
            } else {
                if (updates.id) {
                    await db.Statistic.update(updates, { where: { id: updates.id } });
                }
            }
            res.json({ message: 'Stats updated' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async deleteStat(req, res) {
        try {
            const { id } = req.params;
            await db.Statistic.destroy({ where: { id } });
            res.json({ message: 'Stat deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
