module.exports = (sequelize, DataTypes) => {
    const BotRegistration = sequelize.define('BotRegistration', {
        telegram_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        chat_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        age: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        interest: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        school: {
            type: DataTypes.STRING,
            allowNull: true
        },
        step: {
            type: DataTypes.STRING,
            defaultValue: 'START'
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'PENDING' // PENDING, COMPLETED
        }
    });
    return BotRegistration;
};
