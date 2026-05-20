const Sequelize = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.News = require('./News')(sequelize, Sequelize);
db.NewsMedia = require('./NewsMedia')(sequelize, Sequelize); // Separate model for Media
db.Field = require('./Field')(sequelize, Sequelize);
db.Application = require('./Application')(sequelize, Sequelize);
db.TeamMember = require('./TeamMember')(sequelize, Sequelize);
db.ActiveStudent = require('./ActiveStudent')(sequelize, Sequelize);
db.Statistic = require('./Statistic')(sequelize, Sequelize);
db.SiteSetting = require('./SiteSetting')(sequelize, Sequelize);
db.HeroSlide = require('./HeroSlide')(sequelize, Sequelize);
db.Schedule = require('./Schedule')(sequelize, Sequelize);
db.BotRegistration = require('./BotRegistration')(sequelize, Sequelize);

// Associations
// News <-> NewsMedia
db.News.hasMany(db.NewsMedia, { as: 'media', foreignKey: 'newsId', onDelete: 'CASCADE' });
db.NewsMedia.belongsTo(db.News, { foreignKey: 'newsId' });

module.exports = db;
