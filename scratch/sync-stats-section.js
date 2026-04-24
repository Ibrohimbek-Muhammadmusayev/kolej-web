const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const statsToMove = ['stat_total', 'fields_count', 'stat_uni_top'];

db.serialize(() => {
    statsToMove.forEach(key => {
        db.run('UPDATE Statistics SET section = "home_top" WHERE "key" = ?', [key], (err) => {
            if (err) {
                console.error(`Error updating ${key}:`, err.message);
            } else {
                console.log(`Updated ${key} to home_top section`);
            }
        });
    });
});

db.close();
