module.exports = (sequelize, DataTypes) => {
    const SiteSetting = sequelize.define('SiteSetting', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.TEXT, // Can store JSON strings if needed
            allowNull: true
        },
        type: {
            type: DataTypes.STRING, // 'text', 'image', 'json'
            defaultValue: 'text'
        }
    });
    return SiteSetting;
};
