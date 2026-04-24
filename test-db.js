const db = require('./models');

(async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');

        if (db.HeroSlide) {
            console.log('HeroSlide model is defined.');
            await db.HeroSlide.sync(); // Ensure table exists
            const slides = await db.HeroSlide.findAll();
            console.log('Slides count:', slides.length);
        } else {
            console.error('HeroSlide model is UNDEFINED!');
            console.log('Available models:', Object.keys(db));
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await db.sequelize.close();
    }
})();
