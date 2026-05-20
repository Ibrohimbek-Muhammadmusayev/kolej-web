const db = require('./models');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log("Starting DB queries...");
        const [
            newsMedia, newsMain, fields, team, students, hero, schedules, settings
        ] = await Promise.all([
            db.NewsMedia.findAll({ attributes: ['src'] }),
            db.News.findAll({ attributes: ['image_url'] }),
            db.Field.findAll({ attributes: ['image_url', 'icon_url'] }),
            db.TeamMember.findAll({ attributes: ['image_url'] }),
            db.ActiveStudent.findAll({ attributes: ['image_url'] }),
            db.HeroSlide.findAll({ attributes: ['media_url'] }),
            db.Schedule.findAll({ attributes: ['image_url'] }),
            db.SiteSetting.findAll({ where: { type: 'image' }, attributes: ['value'] })
        ]);
        console.log("DB queries finished successfully.");
        console.log({
            newsMedia: newsMedia.length,
            newsMain: newsMain.length
        });
    } catch (e) {
        console.error("Error during execution:");
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
