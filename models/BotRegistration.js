module.exports = (sequelize, DataTypes) => {
    const BotRegistration = sequelize.define('BotRegistration', {
        chatId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        firstName: DataTypes.STRING,
        username: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dob: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passport: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        education: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fieldId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        isRegistered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        step: {
            type: DataTypes.STRING,
            defaultValue: 'idle'
        }
    });

    return BotRegistration;
};
