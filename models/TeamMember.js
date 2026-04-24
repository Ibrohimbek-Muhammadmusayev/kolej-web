module.exports = (sequelize, DataTypes) => {
    const TeamMember = sequelize.define('TeamMember', {
        full_name_uz: { type: DataTypes.STRING, allowNull: false },
        full_name_ru: { type: DataTypes.STRING },
        full_name_en: { type: DataTypes.STRING },

        role_uz: { type: DataTypes.STRING, allowNull: false },
        role_ru: { type: DataTypes.STRING },
        role_en: { type: DataTypes.STRING },

        image_url: DataTypes.STRING,
        order: { type: DataTypes.INTEGER, defaultValue: 0 }
    });
    return TeamMember;
};
