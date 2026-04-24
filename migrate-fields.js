const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.run(`ALTER TABLE Fields ADD COLUMN apply_url VARCHAR(255);`, (err) => {
        if (err) console.error(`Migration error: ${err.message}`);
        else console.log(`apply_url column added successfully to Fields table!`);
    });
});

db.close();
