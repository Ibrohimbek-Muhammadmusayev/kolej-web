module.exports = (sequelize, DataTypes) => {
    const Application = sequelize.define('Application', {
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dob: {
            type: DataTypes.DATEONLY,
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
        fieldId: { // Only ID stored for simplicity or FK if strict
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('new', 'contacted', 'archived'),
            defaultValue: 'new'
        }
    });

    return Application;
};
