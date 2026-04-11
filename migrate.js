const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    ['title_uz', 'title_ru', 'title_en'].forEach(col => {
        db.run(`ALTER TABLE HeroSlides ADD COLUMN ${col} VARCHAR(255);`, (err) => {
            if (err) console.error(`Skipping ${col}: ${err.message}`);
            else console.log(`Added ${col}`);
        });
    });

    ['description_uz', 'description_ru', 'description_en'].forEach(col => {
        db.run(`ALTER TABLE HeroSlides ADD COLUMN ${col} TEXT;`, (err) => {
            if (err) console.error(`Skipping ${col}: ${err.message}`);
            else console.log(`Added ${col}`);
        });
    });
});

db.close();
