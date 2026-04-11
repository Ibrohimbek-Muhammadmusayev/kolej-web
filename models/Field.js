module.exports = (sequelize, DataTypes) => {
    const Field = sequelize.define('Field', {
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        title_uz: { type: DataTypes.STRING, allowNull: false },
        title_ru: { type: DataTypes.STRING, allowNull: true },
        title_en: { type: DataTypes.STRING, allowNull: true },

        description_uz: { type: DataTypes.TEXT, allowNull: false },
        description_ru: { type: DataTypes.TEXT, allowNull: true },
        description_en: { type: DataTypes.TEXT, allowNull: true },

        icon_url: DataTypes.STRING,
        image_url: DataTypes.STRING,
        apply_url: { type: DataTypes.STRING, allowNull: true },
        is_new: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    return Field;
};
