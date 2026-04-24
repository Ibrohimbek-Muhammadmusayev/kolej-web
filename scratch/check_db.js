const db = require('../models');

async function checkMedia() {
    try {
        const news = await db.News.findAll({
            include: [{ model: db.NewsMedia, as: 'media' }],
            limit: 5
        });
        console.log(JSON.stringify(news, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkMedia();
