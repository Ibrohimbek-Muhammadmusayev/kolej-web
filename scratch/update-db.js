const { sequelize } = require('../models');

async function checkAndAddColumn() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Applications)");
        const columnExists = results.some(column => column.name === 'message');
        
        if (!columnExists) {
            console.log("Adding 'message' column to Applications table...");
            await sequelize.query("ALTER TABLE Applications ADD COLUMN message TEXT");
            console.log("Column added successfully.");
        } else {
            console.log("Column 'message' already exists.");
        }
    } catch (error) {
        console.error("Error updating database:", error);
    } finally {
        await sequelize.close();
    }
}

checkAndAddColumn();
