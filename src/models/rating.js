'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Rating extends Model {
        static associate(models) {
            Rating.belongsTo(models.Customer, { foreignKey: 'customer_id' });
            Rating.belongsTo(models.Technician, { foreignKey: 'technician_id' });
        }
    }

    Rating.init({
        rating_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        technician_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rating: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        images: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Rating',
        tableName: 'ratings',
        timestamps: true
    });

    return Rating;
};
