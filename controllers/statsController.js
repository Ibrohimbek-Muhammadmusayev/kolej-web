const db = require('../models');

module.exports = {
    async getAllStats(req, res) {
        try {
            let stats = await db.Statistic.findAll({ order: [['order', 'ASC']] });

            // Convert to plain objects to modify
            stats = stats.map(s => s.get({ plain: true }));

            // 1. Get real fields count
            const fieldsCount = await db.Field.count();

            // 2. Update or Inject 'fields_count'
            const fieldStatIndex = stats.findIndex(s => s.key === 'fields_count');
            if (fieldStatIndex >= 0) {
                stats[fieldStatIndex].value = fieldsCount.toString();
            } else {
                stats.push({
                    key: 'fields_count',
                    value: fieldsCount.toString(),
                    label_uz: 'Sohalar soni',
                    label_ru: 'Количество направлений',
                    label_en: 'Number of Fields',
                    order: 2
                });
            }

            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateStats(req, res) {
        try {
            // Expect array of updates: [{ id: 1, value: "1250" }, ...]
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
    }
};
