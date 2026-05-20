require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const db = require('./models');
const botManager = require('./bot/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Serve the frontend from the public directory)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend for any unknown route (SPA fallback if needed, or just specific pages)
// Serve frontend pages
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Define known frontend pages
const pages = ['about.html', 'contact.html', 'news.html', 'news-details.html', 'sohalar.html', 'field-details.html'];

pages.forEach(page => {
    app.get('/' + page, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/' + page));
    });
});

// Catch-all for unknown routes -> 404
app.get(/(.*)/, (req, res) => {
    // If it's an API call, return JSON 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Otherwise serve 404.html
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// Create uploads directory if not exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Start Server
// Start Server

// Manual migration: add missing columns to BotRegistration table
async function migrateBotRegistration() {
    try {
        const [cols] = await sequelize.query("PRAGMA table_info(BotRegistrations)");
        const existing = cols.map(c => c.name);
        const newCols = [
            { name: 'fullName',     sql: 'VARCHAR(255)' },
            { name: 'phone',        sql: 'VARCHAR(255)' },
            { name: 'dob',          sql: 'VARCHAR(255)' },
            { name: 'passport',     sql: 'VARCHAR(255)' },
            { name: 'address',      sql: 'VARCHAR(255)' },
            { name: 'education',    sql: 'VARCHAR(255)' },
            { name: 'fieldId',      sql: 'INTEGER' },
            { name: 'isRegistered', sql: 'TINYINT(1) DEFAULT 0' },
            { name: 'step',         sql: "VARCHAR(255) DEFAULT 'idle'" },
        ];
        for (const col of newCols) {
            if (!existing.includes(col.name)) {
                await sequelize.query(`ALTER TABLE BotRegistrations ADD COLUMN "${col.name}" ${col.sql}`);
                console.log(`Migrated: added column ${col.name}`);
            }
        }
    } catch (e) {
        console.error('Migration error:', e.message);
    }
}

sequelize.sync({ force: false }).then(async () => {
    console.log('Database synced');
    await migrateBotRegistration();
    app.listen(PORT, async () => {
        console.log(`Server running on http://localhost:${PORT}`);
        
        // Seed default about texts if they don't exist
        try {
            const defaults = {
                about_desc_uz: "Quva politexnikumi O‘zbekistonning yetakchi o‘quv yurtlaridan biri bo‘lib, kelajak mutaxassislarini tayyorlashda o‘zining munosib o‘rniga ega.",
                about_desc_ru: "Политехникум Кувинского района — одно из ведущих учебных заведений Узбекистана, занимающее достойное место в подготовке будущих специалистов.",
                about_desc_en: "Quva District Polytechnic is one of the leading educational institutions in Uzbekistan, holding a worthy place in training future specialists.",
                about_history_uz: "Bizning o'quv yurtimiz 2005 yilda tashkil topgan bo'lib, o'tgan davr mobaynida minglab yuqori malakali mutaxassislarni tayyorlab berdi. Bugungi kunda texnikumimiz zamonaviy moddiy-texnik bzaga ega.",
                about_history_ru: "Наше учебное заведение было основано в 2005 году и за прошедшее время подготовило тысячи высококвалифицированных специалистов. Сегодня техникум имеет современную материально-техническую базу.",
                about_history_en: "Our educational institution was established in 2005 and has trained thousands of highly qualified specialists over the past period. Today, the technical school has a modern material and technical base.",
                about_mission_uz: "Bizning asosiy maqsadimiz — yoshlarga sifatli ta'lim berish, ularni zamonaviy kasb-hunarlarga o'rgatish va jamiyatimiz rivojiga hissa qo'shadigan yetuk kadrlar qilib tarbiyalashdir.",
                about_mission_ru: "Наша главная цель — дать молодежи качественное образование, обучить современным профессиям и воспитать зрелые кадры, которые внесут вклад в развитие общества.",
                about_mission_en: "Our main goal is to provide quality education to young people, teach them modern professions, and educate mature personnel who contribute to the development of society."
            };

            for (const [key, value] of Object.entries(defaults)) {
                await db.SiteSetting.findOrCreate({
                    where: { key },
                    defaults: { key, value, type: 'text' }
                });
            }
        } catch (e) {
            console.error("Failed to seed default settings", e);
        }

        // Initialize Bot
        try {
            const tokenSetting = await db.SiteSetting.findOne({ where: { key: 'bot_token' } });
            if (tokenSetting && tokenSetting.value) {
                await botManager.startBot(tokenSetting.value.trim());
            }
        } catch (e) {
            console.error("Failed to initialize bot on startup", e);
        }
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
