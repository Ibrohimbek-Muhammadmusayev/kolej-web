const db = require('./models');

async function check() {
    try {
        const stats = await db.Statistic.findAll({ limit: 1 });
        console.log('Columns:', Object.keys(stats[0]?.get({ plain: true }) || {}));
        process.exit();
    } catch (error) {
        console.error('Error checking:', error.message);
        process.exit(1);
    }
}

check();
