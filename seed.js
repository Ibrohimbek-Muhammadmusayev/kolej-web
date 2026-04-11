const { sequelize } = require('./models');
const db = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced (force: true)');

        // 1. Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await db.User.create({
            username: 'admin',
            password: hashedPassword
        });
        console.log('Admin user created');

        // 2. Create Fields (Sohalar) with Multilingual Data
        const fields = [
            {
                slug: 'soft',
                title_uz: 'Dasturiy injiniring',
                title_ru: 'Программная инженерия',
                title_en: 'Software Engineering',
                description_uz: 'Dasturiy ta\'minotni loyihalash, ishlab chiqish va sinovdan o\'tkazish bo\'yicha chuqur bilimlar. Zamonaviy dasturlash tillari (Python, Java, JS) va frameworklarini o\'rganish.',
                description_ru: 'Глубокие знания по проектированию, разработке и тестированию программного обеспечения. Изучение современных языков программирования (Python, Java, JS) и фреймворков.',
                description_en: 'In-depth knowledge of software design, development, and testing. Learning modern programming languages (Python, Java, JS) and frameworks.',
                icon_url: 'https://picsum.photos/400/300?random=1',
                image_url: 'https://picsum.photos/800/600?random=1',
                is_new: true,
                order: 1
            },
            {
                slug: 'net',
                title_uz: 'Kompyuter tarmoqlari',
                title_ru: 'Компьютерные сети',
                title_en: 'Computer Networks',
                description_uz: 'Tarmoq infratuzilmasini yaratish va boshqarish. Cisco texnologiyalari, kiberxavfsizlik asoslari va server ma\'muriyati.',
                description_ru: 'Создание и управление сетевой инфраструктурой. Технологии Cisco, основы кибербезопасности и администрирование серверов.',
                description_en: 'Creating and managing network infrastructure. Cisco technologies, cybersecurity basics, and server administration.',
                icon_url: 'https://picsum.photos/400/300?random=2',
                image_url: 'https://picsum.photos/800/600?random=2',
                is_new: false,
                order: 2
            },
            {
                slug: 'design',
                title_uz: 'Grafik va Web Dizayn',
                title_ru: 'Графический и Веб-дизайн',
                title_en: 'Graphic and Web Design',
                description_uz: 'Foydalanuvchi interfeysi (UI) va tajribasi (UX) dizayni. Adobe Photoshop, Illustrator, Figma dasturlarida ishlash.',
                description_ru: 'Дизайн пользовательского интерфейса (UI) и опыта (UX). Работа в Adobe Photoshop, Illustrator, Figma.',
                description_en: 'User Interface (UI) and User Experience (UX) design. Working with Adobe Photoshop, Illustrator, Figma.',
                icon_url: 'https://picsum.photos/400/300?random=3',
                image_url: 'https://picsum.photos/800/600?random=3',
                is_new: true,
                order: 3
            },
            {
                slug: 'auto',
                title_uz: 'Avtomobilsozlik',
                title_ru: 'Автомобилестроение',
                title_en: 'Automotive Engineering',
                description_uz: 'Zamonaviy avtomobillarga texnik xizmat ko\'rsatish va diagnostika qilish. Dvigatel, transmissiya va elektron tizimlar.',
                description_ru: 'Техническое обслуживание и диагностика современных автомобилей. Двигатель, трансмиссия и электронные системы.',
                description_en: 'Maintenance and diagnostics of modern cars. Engine, transmission, and electronic systems.',
                icon_url: 'https://picsum.photos/400/300?random=4',
                image_url: 'https://picsum.photos/800/600?random=4',
                is_new: false,
                order: 4
            },
            {
                slug: 'account',
                title_uz: 'Buxgalteriya va Moliya',
                title_ru: 'Бухгалтерия и Финансы',
                title_en: 'Accounting and Finance',
                description_uz: 'Korxona moliyasini boshqarish, soliq hisoboti va 1C dasturida ishlash ko\'nikmalari.',
                description_ru: 'Управление финансами предприятия, налоговая отчетность и навыки работы в программе 1С.',
                description_en: 'Corporate finance management, tax reporting, and skills in 1C software.',
                icon_url: 'https://picsum.photos/400/300?random=5',
                image_url: 'https://picsum.photos/800/600?random=5',
                is_new: false,
                order: 5
            },
            {
                slug: 'logistics',
                title_uz: 'Logistika',
                title_ru: 'Логистика',
                title_en: 'Logistics',
                description_uz: 'Yuk tashish jarayonlarini rejalashtirish va boshqarish. Ombor logistikasi va ta\'minot zanjiri menejmenti.',
                description_ru: 'Планирование и управление процессами грузоперевозок. Складская логистика и управление цепями поставок.',
                description_en: 'Planning and managing freight transport processes. Warehouse logistics and supply chain management.',
                icon_url: 'https://picsum.photos/400/300?random=6',
                image_url: 'https://picsum.photos/800/600?random=6',
                is_new: false,
                order: 6
            }
        ];

        await db.Field.bulkCreate(fields);
        console.log('Fields seeded');

        // 3. Create News
        const news = [
            {
                title_uz: 'Kollejimizda "Yosh Dasturchi" tanlovi bo\'lib o\'tdi',
                title_ru: 'В нашем колледже прошел конкурс "Молодой программист"',
                title_en: '"Young Programmer" contest held at our college',
                date: new Date(),
                content_uz: '<p>Kuyidagi yo\'nalishlar bo\'yicha g\'oliblar aniqlandi: Web dasturlash, Mobil ilovalar...</p>',
                content_ru: '<p>Победители были определены по следующим направлениям: Веб-разработка, Мобильные приложения...</p>',
                content_en: '<p>Winners were determined in the following categories: Web development, Mobile applications...</p>',
                description_uz: 'Kollejimiz iqtidorli talabalari o\'rtasida dasturlash bo\'yicha musobaqa tashkil etildi.',
                description_ru: 'Среди талантливых студентов нашего колледжа был организован конкурс по программированию.',
                description_en: 'A programming competition was organized among talented students of our college.',
                views: 120,
                category: 'Tadbir',
                image_url: 'https://picsum.photos/800/400?random=11'
            },
            {
                title_uz: 'Yangi o\'quv yili uchun qabul boshlandi',
                title_ru: 'Начался набор на новый учебный год',
                title_en: 'Admission for the new academic year has started',
                date: new Date(new Date().setDate(new Date().getDate() - 2)),
                content_uz: '<p>2024-2025 o\'quv yili uchun hujjatlar qabuli 20-iyundan boshlanadi...</p>',
                content_ru: '<p>Прием документов на 2024-2025 учебный год начнется с 20 июня...</p>',
                content_en: '<p>Admission of documents for the 2024-2025 academic year starts on June 20th...</p>',
                description_uz: 'Abituriyentlar diqqatiga! Qabul jarayonlari va kerakli hujjatlar ro\'yxati e\'lon qilindi.',
                description_ru: 'Вниманию абитуриентов! Объявлены процессы приема и список необходимых документов.',
                description_en: 'Attention applicants! Admission processes and the list of required documents have been announced.',
                views: 350,
                category: 'E\'lon',
                image_url: 'https://picsum.photos/800/400?random=12'
            },
            {
                title_uz: 'Sport musobaqalarida faxrli o\'rinlar',
                title_ru: 'Почетные места в спортивных соревнованиях',
                title_en: 'Honorable places in sports competitions',
                date: new Date(new Date().setDate(new Date().getDate() - 5)),
                content_uz: '<p>Viloyat miqyosida o\'tkazilgan sport musobaqalarida talabalarimiz sovrinli o\'rinlarni egallashdi.</p>',
                content_ru: '<p>Наши студенты заняли призовые места на спортивных соревнованиях областного масштаба.</p>',
                content_en: '<p>Our students won prizes in regional sports competitions.</p>',
                description_uz: 'Talabalarimiz sport sohasida ham yuqori natijalarni qayd etmoqdalar.',
                description_ru: 'Наши студенты показывают высокие результаты и в спорте.',
                description_en: 'Our students are recording high results in sports as well.',
                views: 85,
                category: 'Sport',
                image_url: 'https://picsum.photos/800/400?random=13'
            }
        ];

        await db.News.bulkCreate(news);
        console.log('News seeded');

        // 4. Create Team Members (About Page)
        const team = [
            {
                full_name_uz: 'Abdullayev A.',
                full_name_ru: 'Абдуллаев А.',
                full_name_en: 'Abdullaev A.',
                role_uz: 'Direktor',
                role_ru: 'Директор',
                role_en: 'Director',
                image_url: 'https://picsum.photos/300/300?random=21',
                order: 1
            },
            {
                full_name_uz: 'Karimov B.',
                full_name_ru: 'Каримов Б.',
                full_name_en: 'Karimov B.',
                role_uz: 'O\'quv ishlari bo\'yicha o\'rinbosar',
                role_ru: 'Зам. по учебной работе',
                role_en: 'Deputy for Academic Affairs',
                image_url: 'https://picsum.photos/300/300?random=22',
                order: 2
            },
            {
                full_name_uz: 'Sobirova D.',
                full_name_ru: 'Собирова Д.',
                full_name_en: 'Sobirova D.',
                role_uz: 'Ma\'naviy-ma\'rifiy ishlar bo\'yicha',
                role_ru: 'По духовно-просветительской работе',
                role_en: 'For Spiritual and Educational Affairs',
                image_url: 'https://picsum.photos/300/300?random=23',
                order: 3
            },
            {
                full_name_uz: 'Aliyev U.',
                full_name_ru: 'Алиев У.',
                full_name_en: 'Aliyev U.',
                role_uz: 'Yoshlar yetakchisi',
                role_ru: 'Лидер молодежи',
                role_en: 'Youth Leader',
                image_url: 'https://picsum.photos/300/300?random=24',
                order: 4
            }
        ];
        await db.TeamMember.bulkCreate(team);
        console.log('Team Members seeded');

        // 5. Create Active Students (Home Page)
        const students = [
            {
                full_name_uz: 'Azizbek Tursunov',
                full_name_ru: 'Азизбек Турсунов',
                full_name_en: 'Azizbek Tursunov',
                field_uz: 'Dasturiy Injiniring',
                field_ru: 'Программная Инженерия',
                field_en: 'Software Engineering',
                achievement_uz: '"One Million Uzbek Coders" g\'olibi, 3 ta xalqaro loyiha muallifi.',
                achievement_ru: 'Победитель "One Million Uzbek Coders", автор 3 международных проектов.',
                achievement_en: 'Winner of "One Million Uzbek Coders", author of 3 international projects.',
                image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
                order: 1
            },
            {
                full_name_uz: 'Malika Karimova',
                full_name_ru: 'Малика Каримова',
                full_name_en: 'Malika Karimova',
                field_uz: 'Dizayn',
                field_ru: 'Дизайн',
                field_en: 'Design',
                achievement_uz: 'Xalqaro dizayn tanlovi g\'olibi, kollej brendingi muallifi.',
                achievement_ru: 'Победительница международного конкурса дизайна, автор брендинга колледжа.',
                achievement_en: 'Winner of international design contest, author of college branding.',
                image_url: 'https://randomuser.me/api/portraits/women/44.jpg',
                order: 2
            },
            {
                full_name_uz: 'Javohir Aliyev',
                full_name_ru: 'Жавохир Алиев',
                full_name_en: 'Javohir Aliyev',
                field_uz: 'Kompyuter Tarmoqlari',
                field_ru: 'Компьютерные Сети',
                field_en: 'Computer Networks',
                achievement_uz: 'Cisco sertifikati egasi, WorldSkills ishtirokchisi.',
                achievement_ru: 'Обладатель сертификата Cisco, участник WorldSkills.',
                achievement_en: 'Cisco certificate holder, WorldSkills participant.',
                image_url: 'https://randomuser.me/api/portraits/men/85.jpg',
                order: 3
            }
        ];
        await db.ActiveStudent.bulkCreate(students);
        console.log('Active Students seeded');

        // 6. Create Statistics
        const stats = [
            {
                key: 'students_count',
                label_uz: 'O\'quvchilar',
                label_ru: 'Студенты',
                label_en: 'Students',
                value: '1200',
                order: 1
            },
            {
                key: 'fields_count',
                label_uz: 'Sohalar',
                label_ru: 'Направления',
                label_en: 'Fields',
                value: '15',
                order: 2
            },
            {
                key: 'entrants_percent',
                label_uz: 'OTMga kirganlar',
                label_ru: 'Поступившие в ВУЗы',
                label_en: 'University Entrants',
                value: '75',
                order: 3
            }
        ];
        await db.Statistic.bulkCreate(stats);
        console.log('Statistics seeded');

        // 7. Create Site Settings
        const settings = [
            { key: 'contact_phone', value: '+998 73 123 45 67', type: 'text' },
            { key: 'contact_email', value: 'info@quvapolitex.uz', type: 'text' },
            { key: 'contact_address_uz', value: 'Farg\'ona viloyati, Quva tumani, A.Navoiy ko\'chasi 1-uy', type: 'text' },
            { key: 'contact_address_ru', value: 'Ферганская область, Кувинский район, ул. А.Навои 1', type: 'text' },
            { key: 'contact_address_en', value: 'Fergana region, Quva district, A.Navoiy street 1', type: 'text' },
            { key: 'hero_title_uz', value: 'Quva tumani Politexnikumi', type: 'text' },
            { key: 'hero_title_ru', value: 'Кувинский Политехнический Колледж', type: 'text' },
            { key: 'hero_title_en', value: 'Quva Polytechnic College', type: 'text' },
            { key: 'map_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1516.357878696084!2d72.06202531539656!3d40.5297129793522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bc865555555555%3A0x5555555555555555!2sQuva%20Politexnikumi!5e0!3m2!1sen!2s!4v1645000000000!5m2!1sen!2s', type: 'text' }
        ];
        await db.SiteSetting.bulkCreate(settings);
        console.log('Site Settings seeded');

        process.exit(0);
    } catch (error) {
        console.error('Seed failed!');
        console.error('Message:', error.message);
        if (error.errors) {
            error.errors.forEach(e => console.error(`- ${e.message} (${e.type})`));
        } else {
            console.error('Full Check:', error);
        }
        process.exit(1);
    }
}

seed();
