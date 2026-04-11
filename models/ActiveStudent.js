module.exports = (sequelize, DataTypes) => {
    const ActiveStudent = sequelize.define('ActiveStudent', {
        full_name_uz: { type: DataTypes.STRING, allowNull: false },
        full_name_ru: { type: DataTypes.STRING },
        full_name_en: { type: DataTypes.STRING },

        field_uz: { type: DataTypes.STRING }, // e.g. "Dasturchi"
        field_ru: { type: DataTypes.STRING },
        field_en: { type: DataTypes.STRING },

        achievement_uz: { type: DataTypes.TEXT },
        achievement_ru: { type: DataTypes.TEXT },
        achievement_en: { type: DataTypes.TEXT },

        image_url: DataTypes.STRING,
        order: { type: DataTypes.INTEGER, defaultValue: 0 }
    });
    return ActiveStudent;
};
