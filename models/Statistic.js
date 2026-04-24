module.exports = (sequelize, DataTypes) => {
    const Statistic = sequelize.define('Statistic', {
        key: { type: DataTypes.STRING, unique: true }, // e.g. "students_count"

        label_uz: { type: DataTypes.STRING },
        label_ru: { type: DataTypes.STRING },
        label_en: { type: DataTypes.STRING },

        section: { type: DataTypes.STRING }, // e.g. "home_hero", "home_achievements"
        description_uz: { type: DataTypes.TEXT },
        description_ru: { type: DataTypes.TEXT },
        description_en: { type: DataTypes.TEXT },

        value: { type: DataTypes.STRING, allowNull: false }, // "1200", "85%"

        order: { type: DataTypes.INTEGER, defaultValue: 0 },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
    return Statistic;
};
