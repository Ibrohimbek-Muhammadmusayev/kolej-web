const db = require('./models');

(async () => {
    try {
        await db.sequelize.sync();

        const stats = [
            { key: 'students_count', value: '1200', label_uz: "O'quvchilar", order: 1 },
            { key: 'fields_count', value: '0', label_uz: "Sohalar", order: 2 }, // Will be overwritten by controller logic but good to have row
            { key: 'uni_admission_percent', value: '85%', label_uz: "OTM ga kirish", order: 3 }
        ];

        for (const stat of stats) {
            const [item, created] = await db.Statistic.findOrCreate({
                where: { key: stat.key },
                defaults: stat
            });
            if (created) console.log(`Created stat: ${stat.key}`);
            else console.log(`Stat exists: ${stat.key}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.sequelize.close();
    }
})();
