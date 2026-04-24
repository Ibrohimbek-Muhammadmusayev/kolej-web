const db = require('./models');

async function seed() {
    try {
        await db.sequelize.sync({ alter: true });

        // Clear existing stats to start fresh
        await db.Statistic.destroy({ where: {} });

        const stats = [
            // TOP STATS (Fixed set, only editable)
            {
                key: 'stat_total',
                label_uz: "O'quvchilar soni",
                label_ru: "Количество студентов",
                label_en: "Number of Students",
                section: 'home_top',
                description_uz: "Bosh sahifa yuqorisidagi asosiy ko'rsatkich",
                value: "1200",
                order: 1,
                isActive: true
            },
            {
                key: 'fields_count',
                label_uz: "Sohalar soni",
                label_ru: "Количество направлений",
                label_en: "Number of Fields",
                section: 'home_top',
                description_uz: "Mavjud yo'nalishlar soni",
                value: "15",
                order: 2,
                isActive: true
            },
            {
                key: 'stat_uni_top',
                label_uz: "OTMga kirganlar",
                label_ru: "Поступившие в ВУЗ",
                label_en: "University Admission",
                section: 'home_top',
                description_uz: "OTMga kirish foizi (%)",
                value: "75",
                order: 3,
                isActive: true
            },

            // ACHIEVEMENT STATS (Dynamic list, addable/deletable)
            {
                key: 'achieve_employment',
                label_uz: "Bitiruvchilar Bandligi",
                label_ru: "Трудоустройство выпускников",
                label_en: "Graduate Employment",
                section: 'home_achievements',
                description_uz: "Bitiruvchilarimizning ish bilan ta'minlanganlik darajasi",
                value: "85%",
                order: 1,
                isActive: true
            },
            {
                key: 'achieve_certs',
                label_uz: "Xalqaro Sertifikatlar",
                label_ru: "Международные сертификаты",
                label_en: "International Certificates",
                section: 'home_achievements',
                description_uz: "O'quvchilarimiz olgan nufuzli sertifikatlar",
                value: "150+",
                order: 2,
                isActive: true
            },
            {
                key: 'achieve_partners',
                label_uz: "Hamkor Tashkilotlar",
                label_ru: "Партнерские организации",
                label_en: "Partner Organizations",
                section: 'home_achievements',
                description_uz: "Kollej bilan hamkorlik qiluvchi korxonalar",
                value: "50+",
                order: 3,
                isActive: true
            }
        ];

        for (const stat of stats) {
            await db.Statistic.create(stat);
        }

        console.log('Statistics re-seeded successfully with separate sections!');
        process.exit();
    } catch (error) {
        console.error('Error seeding statistics:', error);
        process.exit(1);
    }
}

seed();
