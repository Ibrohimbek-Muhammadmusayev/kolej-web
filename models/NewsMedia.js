module.exports = (sequelize, DataTypes) => {
    const NewsMedia = sequelize.define('NewsMedia', {
        type: {
            type: DataTypes.ENUM('image', 'video'),
            allowNull: false
        },
        src: { // Changed from url to src to match frontend
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return NewsMedia;
};
