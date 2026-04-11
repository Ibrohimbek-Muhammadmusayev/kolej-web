module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
        title_uz: { type: DataTypes.STRING, allowNull: false },
        title_ru: { type: DataTypes.STRING, allowNull: true },
        title_en: { type: DataTypes.STRING, allowNull: true },

        content_uz: { type: DataTypes.TEXT, allowNull: false },
        content_ru: { type: DataTypes.TEXT, allowNull: true },
        content_en: { type: DataTypes.TEXT, allowNull: true },

        description_uz: { type: DataTypes.STRING, allowNull: true },
        description_ru: { type: DataTypes.STRING, allowNull: true },
        description_en: { type: DataTypes.STRING, allowNull: true },

        date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        category: {
            type: DataTypes.STRING, // e.g. "Tadbir", "E'lon"
            allowNull: true
        }
    });

    return News;
};
