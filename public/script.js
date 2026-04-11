document.addEventListener('DOMContentLoaded', () => {
    // Carousel logic is now handled in dynamic-content.js (CMS class)


    // Hamburger menu logic
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Theme toggle logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIconMobile = document.getElementById('theme-toggle-dark-icon-mobile');
    const lightIconMobile = document.getElementById('theme-toggle-light-icon-mobile');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            darkIconMobile.classList.add('hidden');
            lightIconMobile.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
            darkIconMobile.classList.remove('hidden');
            lightIconMobile.classList.add('hidden');
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobileBtn) {
        themeToggleMobileBtn.addEventListener('click', toggleTheme);
    }

    // Language switcher logic
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    const langBtnMobile = document.getElementById('lang-btn-mobile');
    const langMenuMobile = document.getElementById('lang-menu-mobile');
    const langOptions = document.querySelectorAll('.lang-option');
    const langOptionsMobile = document.querySelectorAll('.lang-option-mobile');

    if (langBtn && langMenu) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        });
    }

    if (langBtnMobile && langMenuMobile) {
        langBtnMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenuMobile.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (langMenu && !langMenu.classList.contains('hidden') && !langBtn.contains(e.target)) {
            langMenu.classList.add('hidden');
        }
        if (langMenuMobile && !langMenuMobile.classList.contains('hidden') && !langBtnMobile.contains(e.target)) {
            langMenuMobile.classList.add('hidden');
        }
    });

    // Language state management
    let currentLang = localStorage.getItem('lang') || 'uz';

    const translations = {
        uz: {
            'nav-home': "Bosh sahifa",
            'nav-fields': "Yo'nalishlar",
            'nav-about': "Biz haqimizda",
            'nav-students': "O'quvchilar uchun",
            'nav-news': "Yangiliklar",
            'nav-contact': "Aloqa",
            'hero-title': "Quva tumani Politexnikomi",
            'stat-students': "O'quvchilar",
            'stat-fields': "Sohalar",
            'stat-uni': "OTMga kirganlar",
            'btn-about': "Kollej haqida",
            'news-title': "Kollej Hayoti: Yangiliklar va Tadbirlar",
            'news-desc': "Kollejimizda har kuni yangi g'oyalar va qiziqarli tadbirlar bilan to'la. O'quv jarayonlari, sport musobaqalari, madaniy kechalar va ko'plab boshqa tadbirlar orqali talabalarimizning har tomonlama rivojlanishiga sharoit yaratamiz.",
            'btn-more': "Batafsil o'qing",
            'tech-title': "Innovatsion Texnologiyalar Ta'limda",
            'tech-desc': "Zamonaviy dunyoda texnologiyaning o'rni beqiyos. Kollejimiz eng so'nggi innovatsion texnologiyalar va o'qitish usullarini qo'llab-quvvatlaydi.",
            'btn-tech': "Texnologiyalar haqida",
            'sport-title': "Sport va Madaniyat: Sog'lom Avlod",
            'sport-desc': "Kollejimiz nafaqat akademik yutuqlarga, balki talabalarning jismoniy va madaniy rivojlanishiga ham katta e'tibor beradi.",
            'btn-schedule': "Tadbirlar jadvali",
            'fields-title': "Bizda Mavjud Sohalar",
            'fields-subtitle': "Kelajagingizni biz bilan quring. O'zingizga mos yo'nalishni tanlang va professional bo'lib yetishing.",
            'field-soft': "Dasturiy injiniring",
            'field-soft-desc': "Dasturiy ta'minotni loyihalash, ishlab chiqish va sinovdan o'tkazish.",
            'field-net': "Kompyuter tarmoqlari",
            'field-net-desc': "Kompyuter tarmoqlarini sozlash, boshqarish va xavfsizligini ta'minlash.",
            'field-design': "Dizayn",
            'field-design-desc': "Veb-dizayn, grafik dizayn va foydalanuvchi interfeysini loyihalash.",
            'btn-all-fields': "Barcha sohalarni ko'rish",
            'achieve-title': "Yutuqlarimiz Raqamlarda",
            'stat-total': "Jami O'quvchilar",
            'stat-soft-percent': "Dasturiy Injiniring",
            'stat-net-percent': "Kompyuter Tarmoqlari",
            'stat-account-percent': "Buxgalteriya va Moliya",
            'stat-uni-percent': "OTMga Kirish Ko'rsatkichi",
            'students-title': "Bizning Faxrimiz - Aktiv O'quvchilar",
            'contact-title': "Biz Bilan Bog'laning",
            'contact-form-title': "Xabar Qoldiring",
            'label-name': "Ismingiz",
            'label-phone': "Telefon raqamingiz",
            'label-msg': "Xabaringiz",
            'btn-send': "Yuborish",
            'footer-pages': "Sahifalar",
            'footer-contact': "Bog'lanish",
            'footer-desc': "Kelajak kasblarini biz bilan egallang. Zamonaviy ta'lim, innovatsion texnologiyalar va amaliy ko'nikmalar maskani.",
            'footer-address': "Farg'ona viloyati, Quva tumani,<br>A.Navoiy ko'chasi 1-uy",
            'footer-rights': "&copy; 2024 Quva tumani Politexnikumi. Barcha huquqlar himoyalangan.",
            'footer-privacy': "Maxfiylik siyosati",
            'footer-terms': "Foydalanish shartlari",
            'page-sohalar-title': "Bizning Sohalar",
            'field-marketing': "Marketing",
            'field-marketing-desc': "Raqamli marketing, ijtimoiy media marketingi va brendni boshqarish.",
            'field-accounting': "Buxgalteriya",
            'field-accounting-desc': "Moliyaviy hisobot, soliqqa tortish va audit asoslari.",
            'field-hotel': "Mehmonxona biznesi",
            'field-hotel-desc': "Mehmonxona va turizm sohasida menejment va xizmat ko'rsatish.",
            // About Page
            'about-hero-title': "Biz haqimizda",
            'about-hero-desc': "Quva politexnikumi O‘zbekistonning yetakchi o‘quv yurtlaridan biri bo‘lib, kelajak mutaxassislarini tayyorlashda o‘zining munosib o‘rniga ega.",

            // Students Page
            'students-hero-title': "O'quvchilar uchun",
            'students-hero-desc': "Kollejimizdagi barcha o'quv guruhlarining dars jadvallarini joriy sahifadan topishingiz mumkin.",

            // Badges & Modal
            'badge-new': "YANGI",
            'modal-groups': "Guruhlar",
            'modal-course-1': "1-kurs",
            'modal-course-2': "2-kurs",
            'modal-close': "Yopish",
            'nav-fields': "Yo'nalishlar",
            'about-history-title': "Tariximiz",
            'about-history-text': "Bizning o'quv yurtimiz 2005 yilda tashkil topgan bo'lib, o'tgan davr mobaynida minglab yuqori malakali mutaxassislarni tayyorlab berdi. Bugungi kunda kollejimiz zamonaviy moddiy-texnik bzaga ega.",
            'about-mission-title': "Missiyamiz",
            'about-mission-text': "Bizning asosiy maqsadimiz — yoshlarga sifatli ta'lim berish, ularni zamonaviy kasb-hunarlarga o'rgatish va jamiyatimiz rivojiga hissa qo'shadigan yetuk kadrlar qilib tarbiyalashdir.",
            'about-team-title': "Rahbariyat",
            'team-role-1': "Direktor",
            'team-role-2': "O'quv ishlari bo'yicha o'rinbosar",
            'team-role-3': "Ma'naviy-ma'rifiy ishlar bo'yicha",
            'team-role-4': "Yoshlar yetakchisi",

            // News Page
            'news-page-title': "Bizning Yangiliklar",
            'news-item-1-title': "Kollejimizda \"Yoshlar va Kelajak\" forumi bo'lib o'tdi",
            'news-item-1-desc': "Bugun kollejimizda tuman miqyosidagi yoshlar forumi o'tkazildi. Unda 500 dan ortiq yoshlar ishtirok etdilar va o'zlarini qiziqtirgan savollarga javob oldilar.",
            'news-item-1-date': "12 Mart, 2024",
            'news-item-2-title': "Yangi o'quv korpusi foydalanishga topshirildi",
            'news-item-2-desc': "Zamonaviy axborot texnologiyalari bilan jihozlangan yangi o'quv binosi talabalar ixtiyoriga berildi. Endi darslar yanada qiziqarli bo'ladi.",
            'news-item-2-date': "5 Fevral, 2024",
            'news-item-3-title': "Sport musobaqalari g'oliblari taqdirlandi",
            'news-item-3-desc': "Viloyat miqyosida o'tkazilgan \"Barkamol avlod\" sport o'yinlarida kollejimiz jamoasi faxrli birinchi o'rinni egalladi.",
            'news-item-3-date': "20 Yanvar, 2024",
            'news-item-4-title': "Robototexnika to'garagi ish boshladi",
            'news-item-4-desc': "Talabalarimizning innovatsion g'oyalarini qo'llab-quvvatlash maqsadida yangi robototexnika laboratoriyasi o'z faoliyatini boshladi.",
            'news-item-4-date': "15 Yanvar, 2024",

            // Contact Page
            'contact-page-title': "Biz bilan bog'lanish",
            'contact-info-title': "Aloqa ma'lumotlari",
            'contact-form-page-title': "Xabar yuborish",
            'back-to-fields': "Barcha sohalarga qaytish",
            'about-field': "Soha haqida",
            'active-groups': "Mavjud Guruhlar",
            'what-learn': "Nimalarni o'rganasiz?",
            'future-jobs': "Kelajakdagi kasblar",
            'apply-btn': "Hujjat Topshirish",
            'education-type': "Kunduzgi",
            'faq-title': "Ko'p so'raladigan savollar",
            'student-count': "talaba",
            'modal-title': "Hujjat Topshirish",
            'modal-desc': "Iltimos, quyidagi ma'lumotlarni to'ldiring. Biz siz bilan bog'lanamiz.",
            'label-fullname': "F.I.SH (To'liq ism)",
            'label-dob': "Tug'ilgan sana",
            'label-passport': "Pasport (Seriya va Raqam)",
            'label-address': "Manzil (Viloyat, Tuman)",
            'label-education': "Tamomlagan ta'lim muassasasi",
            'btn-submit': "Yuborish",
            'btn-cancel': "Bekor qilish",
            'success-msg': "Rahmat! Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.",
            'group-num': "Guruh",

        },
        ru: {
            'nav-home': "Главная",
            'nav-fields': "Направления",
            'nav-about': "О нас",
            'nav-students': "Для студентов",
            'nav-news': "Новости",
            'nav-contact': "Контакты",
            'hero-title': "Политехникум Кувинского района",
            'stat-students': "Студенты",
            'stat-fields': "Направления",
            'stat-uni': "Поступили в ВУЗ",
            'btn-about': "О колледже",
            'news-title': "Жизнь колледжа: Новости и мероприятия",
            'news-desc': "Наш колледж полон новых идей и интересных мероприятий каждый день. Мы создаем условия для всестороннего развития наших студентов через учебные процессы, спортивные соревнования и культурные вечера.",
            'btn-more': "Подробнее",
            'tech-title': "Инновационные технологии в образовании",
            'tech-desc': "В современном мире роль технологий неоценима. Наш колледж поддерживает новейшие инновационные технологии и методы обучения.",
            'btn-tech': "О технологиях",
            'sport-title': "Спорт и культура: Здоровое поколение",
            'sport-desc': "Наш колледж уделяет большое внимание не только академическим достижениям, но и физическому и культурному развитию студентов.",
            'btn-schedule': "Расписание мероприятий",
            'fields-title': "Доступные направления",
            'fields-subtitle': "Постройте свое будущее с нами. Выберите подходящее направление и станьте профессионалом.",
            'field-soft': "Программная инженерия",
            'field-soft-desc': "Проектирование, разработка и тестирование программного обеспечения.",
            'field-net': "Компьютерные сети",
            'field-net-desc': "Настройка, управление и безопасность компьютерных сетей.",
            'field-design': "Дизайн",
            'field-design-desc': "Веб-дизайн, графический дизайн и проектирование пользовательских интерфейсов.",
            'btn-all-fields': "Посмотреть все направления",
            'achieve-title': "Наши достижения в цифрах",
            'stat-total': "Всего студентов",
            'stat-soft-percent': "Программная инженерия",
            'stat-net-percent': "Компьютерные сети",
            'stat-account-percent': "Бухгалтерия и финансы",
            'stat-uni-percent': "Показатель поступления в ВУЗ",
            'students-title': "Наша гордость - Активные студенты",
            'contact-title': "Свяжитесь с нами",
            'contact-form-title': "Оставить сообщение",
            'label-name': "Ваше имя",
            'label-phone': "Ваш номер телефона",
            'label-msg': "Ваше сообщение",
            'btn-send': "Отправить",
            'footer-pages': "Страницы",
            'footer-contact': "Контакты",
            'footer-desc': "Осваивайте профессии будущего вместе с нами. Центр современного образования, инновационных технологий и практических навыков.",
            'footer-address': "Ферганская область, Кувинский район,<br>улица А.Навои, дом 1",
            'footer-rights': "&copy; 2024 Политехникум Кувинского района. Все права защищены.",
            'footer-privacy': "Политика конфиденциальности",
            'footer-terms': "Условия использования",
            'page-sohalar-title': "Наши направления",
            'field-marketing': "Маркетинг",
            'field-marketing-desc': "Цифровой маркетинг, маркетинг в социальных сетях и управление брендом.",
            'field-accounting': "Бухгалтерия",
            'field-accounting-desc': "Финансовая отчетность, налогообложение и основы аудита.",
            'field-hotel': "Гостиничный бизнес",
            'field-hotel-desc': "Менеджмент и обслуживание в сфере гостиничного бизнеса и туризма.",
            // About Page
            'about-hero-title': "О нас",
            'about-hero-desc': "Политехникум Кувинского района — одно из ведущих учебных заведений Узбекистана, занимающее достойное место в подготовке будущих специалистов.",

            // Students Page
            'students-hero-title': "Для студентов",
            'students-hero-desc': "На этой странице вы можете найти расписание занятий для всех учебных групп нашего колледжа.",

            // Badges & Modal
            'badge-new': "НОВЫЙ",
            'modal-groups': "Группы",
            'modal-course-1': "1-курс",
            'modal-course-2': "2-курс",
            'modal-close': "Закрыть",
            'nav-fields': "Направления",
            'about-history-title': "Наша история",
            'about-history-text': "Наше учебное заведение было основано в 2005 году и за прошедшее время подготовило тысячи высококвалифицированных специалистов. Сегодня колледж имеет современную материально-техническую базу.",
            'about-mission-title': "Наша миссия",
            'about-mission-text': "Наша главная цель — дать молодежи качественное образование, обучить современным профессиям и воспитать зрелые кадры, которые внесут вклад в развитие общества.",
            'about-team-title': "Руководство",
            'team-role-1': "Директор",
            'team-role-2': "Заместитель по учебной работе",
            'team-role-3': "По духовно-просветительской работе",
            'team-role-4': "Лидер молодежи",

            // News Page
            'news-page-title': "Наши новости",
            'news-item-1-title': "В колледже прошел форум «Молодежь и будущее»",
            'news-item-1-desc': "Сегодня в нашем колледже прошел районный молодежный форум. В нем приняли участие более 500 молодых людей и получили ответы на интересующие их вопросы.",
            'news-item-1-date': "12 Марта, 2024",
            'news-item-2-title': "Сдан в эксплуатацию новый учебный корпус",
            'news-item-2-desc': "Студентам предоставлен новый учебный корпус, оснащенный современными информационными технологиями. Теперь уроки станут еще интереснее.",
            'news-item-2-date': "5 Февраля, 2024",
            'news-item-3-title': "Награждены победители спортивных соревнований",
            'news-item-3-desc': "Команда нашего колледжа заняла почетное первое место в спортивных играх «Баркамол авлод», проходивших на областном уровне.",
            'news-item-3-date': "20 Января, 2024",
            'news-item-4-title': "Начал работу кружок робототехники",
            'news-item-4-desc': "Для поддержки инновационных идей наших студентов начала свою деятельность новая лаборатория робототехники.",
            'news-item-4-date': "15 Января, 2024",

            // Contact Page
            'contact-page-title': "Свяжитесь с нами",
            'contact-info-title': "Контактная информация",
            'contact-form-page-title': "Отправить сообщение",
            'back-to-fields': "Вернуться ко всем направлениям",
            'about-field': "О направлении",
            'active-groups': "Активные группы",
            'what-learn': "Что вы изучите?",
            'future-jobs': "Будущие профессии",
            'apply-btn': "Подать документы",
            'education-type': "Дневное",
            'faq-title': "Часто задаваемые вопросы",
            'student-count': "студента",
            'modal-title': "Подача документов",
            'modal-desc': "Пожалуйста, заполните форму ниже. Мы свяжемся с вами.",
            'label-fullname': "Ф.И.О. (Полное имя)",
            'label-dob': "Дата рождения",
            'label-passport': "Паспорт (Серия и Номер)",
            'label-address': "Адрес (Область, Район)",
            'label-education': "Оконченное учебное заведение",
            'btn-submit': "Отправить",
            'btn-cancel': "Отмена",
            'success-msg': "Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.",
            'group-num': "Группа",

        },
        en: {
            'nav-home': "Home",
            'nav-fields': "Fields",
            'nav-about': "About Us",
            'nav-students': "For Students",
            'nav-news': "News",
            'nav-contact': "Contact",
            'hero-title': "Quva District Polytechnic",
            'stat-students': "Students",
            'stat-fields': "Fields",
            'stat-uni': "University Admits",
            'btn-about': "About College",
            'news-title': "College Life: News and Events",
            'news-desc': "Our college is full of new ideas and interesting events every day. We create conditions for the comprehensive development of our students through educational processes, sports competitions, and cultural evenings.",
            'btn-more': "Read More",
            'tech-title': "Innovative Technologies in Education",
            'tech-desc': "In the modern world, the role of technology is invaluable. Our college supports the latest innovative technologies and teaching methods.",
            'btn-tech': "About Technologies",
            'sport-title': "Sports and Culture: Healthy Generation",
            'sport-desc': "Our college pays great attention not only to academic achievements but also to the physical and cultural development of students.",
            'btn-schedule': "Event Schedule",
            'fields-title': "Available Fields",
            'fields-subtitle': "Build your future with us. Choose the direction that suits you and become a professional.",
            'field-soft': "Software Engineering",
            'field-soft-desc': "Software design, development, and testing.",
            'field-net': "Computer Networks",
            'field-net-desc': "Configuration, management, and security of computer networks.",
            'field-design': "Design",
            'field-design-desc': "Web design, graphic design, and user interface design.",
            'btn-all-fields': "View All Fields",
            'achieve-title': "Our Achievements in Numbers",
            'stat-total': "Total Students",
            'stat-soft-percent': "Software Engineering",
            'stat-net-percent': "Computer Networks",
            'stat-account-percent': "Accounting and Finance",
            'stat-uni-percent': "University Admission Rate",
            'students-title': "Our Pride - Active Students",
            'contact-title': "Contact Us",
            'contact-form-title': "Leave a Message",
            'label-name': "Your Name",
            'label-phone': "Your Phone Number",
            'label-msg': "Your Message",
            'btn-send': "Send",
            'footer-pages': "Pages",
            'footer-contact': "Contact",
            'footer-desc': "Master future professions with us. A center of modern education, innovative technologies, and practical skills.",
            'footer-address': "Fergana region, Quva district,<br>A.Navoiy street, 1",
            'footer-rights': "&copy; 2024 Quva District Polytechnic. All rights reserved.",
            'footer-privacy': "Privacy Policy",
            'footer-terms': "Terms of Use",
            'page-sohalar-title': "Our Fields",
            'field-marketing': "Marketing",
            'field-marketing-desc': "Digital marketing, social media marketing, and brand management.",
            'field-accounting': "Accounting",
            'field-accounting-desc': "Financial reporting, taxation, and auditing basics.",
            'field-hotel': "Hotel Management",
            'field-hotel-desc': "Management and service in the hotel and tourism industry.",
            // About Page
            'about-hero-title': "About Us",
            'about-hero-desc': "Quva District Polytechnic is one of the leading educational institutions in Uzbekistan, holding a worthy place in training future specialists.",

            // Students Page
            'students-hero-title': "For Students",
            'students-hero-desc': "You can find the class schedules for all study groups in our college on this page.",

            // Badges & Modal
            'badge-new': "NEW",
            'modal-groups': "Groups",
            'modal-course-1': "1st Year",
            'modal-course-2': "2nd Year",
            'modal-close': "Close",
            'nav-fields': "Fields",
            'about-history-title': "Our History",
            'about-history-text': "Our educational institution was established in 2005 and has trained thousands of highly qualified specialists over the past period. Today, the college has a modern material and technical base.",
            'about-mission-title': "Our Mission",
            'about-mission-text': "Our main goal is to provide quality education to young people, teach them modern professions, and educate mature personnel who contribute to the development of society.",
            'about-team-title': "Leadership",
            'team-role-1': "Director",
            'team-role-2': "Deputy for Academic Affairs",
            'team-role-3': "For Spiritual and Educational Affairs",
            'team-role-4': "Youth Leader",

            // News Page
            'news-page-title': "Our News",
            'news-item-1-title': "The Youth and Future Forum was held at our college",
            'news-item-1-desc': "Today, a district-level youth forum was held at our college. More than 500 young people took part in it and received answers to their questions.",
            'news-item-1-date': "March 12, 2024",
            'news-item-2-title': "New academic building commissioned",
            'news-item-2-desc': "A new academic building equipped with modern information technologies has been given to students. Now lessons will be even more interesting.",
            'news-item-2-date': "February 5, 2024",
            'news-item-3-title': "Winners of sports competitions awarded",
            'news-item-3-desc': "Our college team took the proud first place in the \"Barkamol Avlod\" sports games held at the regional level.",
            'news-item-3-date': "January 20, 2024",
            'news-item-4-title': "Robotics club started",
            'news-item-4-desc': "A new robotics laboratory has started its activities to support the innovative ideas of our students.",
            'news-item-4-date': "January 15, 2024",

            // Contact Page
            'contact-page-title': "Contact Us",
            'contact-info-title': "Contact Information",
            'contact-form-page-title': "Send a Message",
            'back-to-fields': "Back to All Fields",
            'about-field': "About Field",
            'active-groups': "Active Groups",
            'what-learn': "What will you learn?",
            'future-jobs': "Future Careers",
            'apply-btn': "Apply Now",
            'education-type': "Full-time",
            'faq-title': "Frequently Asked Questions",
            'student-count': "students",
            'modal-title': "Apply Now",
            'modal-desc': "Please fill out the form below. We will contact you.",
            'label-fullname': "Full Name",
            'label-dob': "Date of Birth",
            'label-passport': "Passport (Series and Number)",
            'label-address': "Address (Region, District)",
            'label-education': "Previous Education",
            'btn-submit': "Submit",
            'btn-cancel': "Cancel",
            'success-msg': "Thank you! Your application has been received. We will contact you soon.",
            'group-num': "Group",

        }
    };


    function updateLangUI(lang) {
        // Update UI active state
        // Desktop
        document.querySelectorAll('.lang-check').forEach(check => check.classList.add('hidden'));
        const desktopOption = document.querySelector(`.lang-option[data-lang="${lang}"]`);
        if (desktopOption) {
            desktopOption.querySelector('.lang-check').classList.remove('hidden');
        }
        // Mobile
        document.querySelectorAll('.lang-check-mobile').forEach(check => check.classList.add('hidden'));
        const mobileOption = document.querySelector(`.lang-option-mobile[data-lang="${lang}"]`);
        if (mobileOption) {
            mobileOption.querySelector('.lang-check-mobile').classList.remove('hidden');
        }

        // Apply translations
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
    }

    updateLangUI(currentLang);

    function setLanguage(e) {
        e.preventDefault();
        const lang = e.currentTarget.dataset.lang;
        if (lang) {
            currentLang = lang;
            localStorage.setItem('lang', lang);
            updateLangUI(lang);
            // Start statistics animation again to refresh numbers/context if needed
            // but usually not needed for text change only.

            // Close the menu after selection
            if (langMenu && !langMenu.classList.contains('hidden')) {
                langMenu.classList.add('hidden');
            }
            if (langMenuMobile && !langMenuMobile.classList.contains('hidden')) {
                langMenuMobile.classList.add('hidden');
            }
        }
    }

    langOptions.forEach(option => option.addEventListener('click', setLanguage));
    langOptionsMobile.forEach(option => option.addEventListener('click', setLanguage));


    // Info carousel logic
    const infoCarousel = document.getElementById('info-carousel');
    if (infoCarousel) {
        const infoSlides = Array.from(infoCarousel.children);
        const infoPrevBtn = document.getElementById('info-prev');
        const infoNextBtn = document.getElementById('info-next');
        let currentInfoSlide = 0;
        let isAnimating = false;

        // Set initial state
        infoSlides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.add('right');
            }
            slide.style.transform = `translateX(${index * 100}%)`;
        });

        function moveSlide(direction) {
            if (isAnimating) return;
            isAnimating = true;

            const oldIndex = currentInfoSlide;
            if (direction === 'next') {
                currentInfoSlide = (currentInfoSlide + 1) % infoSlides.length;
            } else {
                currentInfoSlide = (currentInfoSlide - 1 + infoSlides.length) % infoSlides.length;
            }

            infoSlides.forEach((slide, index) => {
                const offset = (index - currentInfoSlide) * 100;
                slide.style.transform = `translateX(${offset}%)`;
            });

            setTimeout(() => {
                isAnimating = false;
            }, 500); // Must match the CSS transition duration
        }

        if (infoNextBtn) {
            infoNextBtn.addEventListener('click', () => {
                moveSlide('next');
                resetInfoInterval();
            });
        }

        if (infoPrevBtn) {
            infoPrevBtn.addEventListener('click', () => {
                moveSlide('prev');
                resetInfoInterval();
            });
        }

        let infoAutoPlayInterval = setInterval(() => moveSlide('next'), 5000); // Auto-slide every 5 seconds

        function resetInfoInterval() {
            clearInterval(infoAutoPlayInterval);
            infoAutoPlayInterval = setInterval(() => moveSlide('next'), 5000);
        }
    }
    // Unified Statistics Logic (Numbers + Bars)
    const observerOptions = {
        threshold: 0.2 // Trigger earlier
    };

    const runStatsAnimation = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;

                // 1. Animate Numbers
                const counters = section.querySelectorAll('.count-up:not(.started)');
                counters.forEach(counter => {
                    counter.classList.add('started');
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.textContent = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                            counter.classList.add('finished');
                        }
                    };
                    updateCounter();
                });

                // 2. Animate Bar Charts (Horizontal)
                const bars = section.querySelectorAll('.bar-chart-fill:not(.started)');
                bars.forEach(bar => {
                    bar.classList.add('started');
                    const width = bar.getAttribute('data-width'); // Changed from data-height
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });

                // Stop observing this section once triggered
                observer.unobserve(section);
            }
        });
    };

    const statsObserver = new IntersectionObserver(runStatsAnimation, observerOptions);

    // Robust Selector Strategy
    // Find all potential containers that have 'count-up' elements inside them
    document.querySelectorAll('.count-up').forEach(counter => {
        // Look for the nearest logical container: section, or a specialized grid/layout div
        const container = counter.closest('section') || counter.closest('.grid') || counter.parentElement;
        if (container) {
            statsObserver.observe(container);
        }
    });

    // Active Students Scroll Logic
    const scrollContainer = document.getElementById('students-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -350, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 350, behavior: 'smooth' });
        });
    }

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('hidden');
            backToTopBtn.classList.add('flex');
        } else {
            backToTopBtn.classList.add('hidden');
            backToTopBtn.classList.remove('flex');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Field Details Data
    const fieldDetails = {
        'soft': {
            isNew: true,
            duration: '2 yil',
            quota: 60,
            contract: '3.5 mln',
            skills: ['Dasturlash asoslari (C++, Python)', 'Web Dasturlash (HTML, CSS, JS)', 'Ma\'lumotlar bazasi (SQL)', 'Backend (Node.js/PHP)'],
            jobs: ['Dasturchi (Junior)', 'Web Dizayner', 'Ma\'lumotlar bazasi administratori', 'IT mutaxassis'],
            faq: [
                { q: "Diplom xalqaro tan olinadimi?", a: "Ha, bizning diplomlarimiz davlat namunasidagi bo'lib, xorijda ham tan olinadi." },
                { q: "Amaliyot qayerda bo'ladi?", a: "IT Park rezidentlari va mahalliy IT kompaniyalarda." }
            ],
            groups: [
                { name: "301-23", course: 2, count: 24, mentor: "Aliyeva N." },
                { name: "302-23", course: 2, count: 22, mentor: "Qosimov B." },
                { name: "305-24", course: 1, count: 28, mentor: "Valiyev S." },
                { name: "306-24", course: 1, count: 26, mentor: "Tursunova M." }
            ]
        },
        'net': {
            isNew: false,
            duration: '2 yil',
            quota: 40,
            contract: '3.2 mln',
            skills: ['Tarmoq administratsiyasi', 'Serverlarni sozlash', 'Kiberxavfsizlik asoslari', 'Linux OT'],
            jobs: ['Tarmoq administratori', 'Tizim administratori', 'Xavfsizlik mutaxassisi', 'Texnik qo\'llab-quvvatlash'],
            faq: [
                { q: "Sertifikat beriladimi?", a: "Ha, Cisco va MikroTik sertifikatlari olish imkoniyati mavjud." }
            ],
            groups: [
                { name: "401-23", course: 2, count: 20, mentor: "Sobirov K." },
                { name: "404-24", course: 1, count: 25, mentor: "Rahimov D." }
            ]
        },
        'design': {
            isNew: true,
            duration: '2 yil',
            quota: 30,
            contract: '3.8 mln',
            skills: ['Grafik dizayn (Photoshop, Illustrator)', 'UI/UX Dizayn', 'Web Dizayn', 'Brending'],
            jobs: ['Grafik dizayner', 'UI/UX dizayner', 'SMM dizayner', 'Art direktor yordamchisi'],
            faq: [
                { q: "Kompyuter kerakmi?", a: "O'qish davomida kuchli grafik stansiyalardan foydalanish imkoniyati yaratilgan." }
            ],
            groups: [
                { name: "501-24", course: 1, count: 18, mentor: "Azizova L." }
            ]
        },
        'marketing': {
            isNew: true,
            duration: '1.5 yil',
            quota: 40,
            contract: '3.0 mln',
            skills: ['SMM', 'Raqamli Marketing', 'Brending', 'Kopirayting', 'Targeting'],
            jobs: ['SMM menejer', 'Marketing mutaxassisi', 'PR menejer', 'Kontent menejer'],
            faq: [
                { q: "Ishga joylashishga yordam berasizmi?", a: "Ha, hamkor kompaniyalarga tavsiya qilamiz." }
            ],
            groups: [
                { name: "601-24", course: 1, count: 22, mentor: "Karimov O." },
                { name: "602-24", course: 1, count: 20, mentor: "Xoliqova Z." }
            ]
        },
        'accounting': {
            isNew: false,
            duration: '2 yil',
            quota: 50,
            contract: '2.8 mln',
            skills: ['1C Buxgalteriya', 'Soliq hisoboti', 'Audit asoslari', 'Moliya tahlili'],
            jobs: ['Buxgalter yordamchisi', 'G\'aznachi', 'Soliq maslahatchisi', 'Iqtisodchi'],
            faq: [],
            groups: [
                { name: "101-23", course: 2, count: 30, mentor: "Norov A." },
                { name: "102-23", course: 2, count: 28, mentor: "Saidov M." },
                { name: "103-24", course: 1, count: 32, mentor: "Obidova G." }
            ]
        },
        'hotel': {
            isNew: false,
            duration: '1.5 yil',
            quota: 25,
            contract: '3.0 mln',
            skills: ['Mehmonxona boshqaruvi', 'Turizm asoslari', 'Mijozlarga xizmat ko\'rsatish', 'Ingliz tili (Soha bo\'yicha)'],
            jobs: ['Resepshn', 'Administrator', 'Tur agent', 'Gid-tarjimon'],
            faq: [],
            groups: [
                { name: "201-23", course: 2, count: 20, mentor: "Rustamova Sh." }
            ]
        }
    };

    // Modal Logic & Field Details Page Logic
    const fieldCards = document.querySelectorAll('.field-card');
    const modal = document.getElementById('field-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    // 1. Sohalar Page Redirect Logic
    if (fieldCards.length > 0) {
        // Render New Badges
        fieldCards.forEach(card => {
            const fieldKey = card.getAttribute('data-field');
            if (fieldDetails[fieldKey] && fieldDetails[fieldKey].isNew) {
                const badge = card.querySelector('.new-badge');
                if (badge) badge.classList.remove('hidden');
            }

            // Redirect on click
            card.addEventListener('click', () => {
                const fieldKey = card.getAttribute('data-field');
                window.location.href = `field-details.html?id=${fieldKey}`;
            });
        });
    }

    // 2. Field Details Page Logic
    // 2. Field Details Page Logic - MOVED TO dynamic-content.js
    // The static rendering logic has been removed to allow dynamic-content.js to handle fetching from API.


    // --- MODAL LOGIC ---
    const appModal = document.getElementById('application-modal');
    const openModalBtn = document.getElementById('open-application-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const submitBtn = document.getElementById('submit-application');
    const appForm = document.getElementById('application-form');

    // Open Modal
    if (openModalBtn && appModal) {
        openModalBtn.addEventListener('click', () => {
            document.getElementById('field-id').value = fieldId; // Set hidden field ID
            appModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Disable background scroll
        });
    }

    // Close Modal Function
    const closeAppModal = () => {
        appModal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAppModal);
    }

    // Close on Backdrop Click
    if (appModal) {
        appModal.addEventListener('click', (e) => {
            if (e.target.id === 'modal-backdrop' || e.target === appModal) {
                closeAppModal();
            }
        });
    }

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && appModal && !appModal.classList.contains('hidden')) {
            closeAppModal();
        }
    });

    // Submit Form
    if (submitBtn && appForm) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default if it's a submit button
            if (appForm.checkValidity()) {
                const formData = new FormData(appForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Yuborilmoqda...';

                    const res = await fetch('/api/applications', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    if (res.ok) {
                        alert(translations[currentLang]['success-msg'] || "Arizangiz qabul qilindi!");
                        appForm.reset();
                        closeAppModal();
                    } else {
                        const errData = await res.json();
                        alert('Xatolik: ' + (errData.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error submitting application:', error);
                    alert("Server bilan aloqa yo'q.");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Yuborish'; // Restore original text (ideally fetching from translation)
                }
            } else {
                appForm.reportValidity();
            }
        });
    }



    // 3. News Details Logic - Removed (Handled by news-script.js)

});