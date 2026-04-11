const db = require('./models');

(async () => {
    try {
        await db.sequelize.authenticate();
        console.log("DB Content:");

        const stats = await db.Statistic.findAll();
        stats.forEach(s => {
            console.log(`Key: ${s.key}, Value: ${s.value}, Section: ${s.section}, Desc: ${s.description_uz}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await db.sequelize.close();
    }
})();
