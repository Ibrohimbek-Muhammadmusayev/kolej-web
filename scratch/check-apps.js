const { Application } = require('../models');

async function checkApps() {
    try {
        const apps = await Application.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log(JSON.stringify(apps, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        const { sequelize } = require('../models');
        await sequelize.close();
    }
}

checkApps();
