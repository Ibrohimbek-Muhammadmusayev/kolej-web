module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        title_uz: { type: DataTypes.STRING, allowNull: false },
        title_ru: { type: DataTypes.STRING },
        title_en: { type: DataTypes.STRING },
        
        description_uz: { type: DataTypes.TEXT },
        description_ru: { type: DataTypes.TEXT },
        description_en: { type: DataTypes.TEXT },
        
        course: { type: DataTypes.STRING }, // e.g. "1-Kurs", "2-Kurs"
        image_url: { type: DataTypes.STRING },
        order: { type: DataTypes.INTEGER, defaultValue: 0 },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
    return Schedule;
};
