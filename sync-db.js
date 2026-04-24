const db = require('./models');
const bcrypt = require('bcryptjs');

const syncDatabase = async () => {
    try {
        await db.sequelize.sync({ alter: true }); // 'alter' updates tables if models change
        console.log("Database synced successfully.");

        // Create default admin if not exists
        const adminExists = await db.User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });
            console.log("Default admin created: admin / admin123");
        }

    } catch (error) {
        console.error("Error syncing database:", error);
    } finally {
        await db.sequelize.close();
    }
};

syncDatabase();
