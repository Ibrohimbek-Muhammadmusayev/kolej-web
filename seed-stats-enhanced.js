const db = require('./models');

(async () => {
    try {
        await db.sequelize.authenticate();

        // Check if columns exist, if not, we might need to force sync or alter table
        // For simplicity in this dev environment, we can use sync({ alter: true })
        // But first let's see if we can just define the model and sync.

        console.log("Syncing database...");
        await db.sequelize.sync({ alter: true }); // This will add new columns

        const stats = [
            {
                key: 'students_count',
                value: '1200',
                label_uz: "Jami O'quvchilar",
                section: 'home_hero',
                description_uz: "Bosh sahifa yuqorisidagi o'quvchilar soni.",
                order: 1
            },
            {
                key: 'fields_count',
                value: '0',
                label_uz: "Mavjud Sohalar",
                section: 'home_fields', // It is actually in home hero too
                description_uz: "Avtomatik hisoblanadi. Admin paneldan soha qo'shilganda o'zgaradi.",
                order: 2
            },
            {
                key: 'uni_admission_percent',
                value: '85%',
                label_uz: "OTM ga Kirish",
                section: 'home_hero',
                description_uz: "Bitiruvchilarning OTMga kirish foizi.",
                order: 3
            },
            {
                key: 'soft_eng_percent',
                value: '85%',
                label_uz: "Dasturiy Injiniring",
                section: 'home_achievements',
                description_uz: "Yutuqlar qismidagi Dasturiy Injiniring foizi.",
                order: 4
            },
            {
                key: 'net_percent',
                value: '70%',
                label_uz: "Kompyuter Tarmoqlari",
                section: 'home_achievements',
                description_uz: "Yutuqlar qismidagi Kompyuter Tarmoqlari foizi.",
                order: 5
            },
            {
                key: 'account_percent',
                value: '90%',
                label_uz: "Buxgalteriya va Moliya",
                section: 'home_achievements',
                description_uz: "Yutuqlar qismidagi Buxgalteriya foizi.",
                order: 6
            }
        ];

        for (const stat of stats) {
            const [item, created] = await db.Statistic.findOrCreate({
                where: { key: stat.key },
                defaults: stat
            });

            if (!created) {
                // Update existing to ensure new fields are populated
                await item.update(stat);
                console.log(`Updated stat: ${stat.key}`);
            } else {
                console.log(`Created stat: ${stat.key}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.sequelize.close();
    }
})();
