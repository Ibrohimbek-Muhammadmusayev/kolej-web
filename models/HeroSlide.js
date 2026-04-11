module.exports = (sequelize, DataTypes) => {
    const HeroSlide = sequelize.define('HeroSlide', {
        title_uz: { type: DataTypes.STRING, allowNull: true },
        title_ru: { type: DataTypes.STRING, allowNull: true },
        title_en: { type: DataTypes.STRING, allowNull: true },
        description_uz: { type: DataTypes.TEXT, allowNull: true },
        description_ru: { type: DataTypes.TEXT, allowNull: true },
        description_en: { type: DataTypes.TEXT, allowNull: true },
        media_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        media_type: {
            type: DataTypes.ENUM('image', 'video'),
            defaultValue: 'image',
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    return HeroSlide;
};
