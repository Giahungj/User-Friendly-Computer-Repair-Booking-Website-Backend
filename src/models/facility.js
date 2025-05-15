'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Facility extends Model {
        static associate(models) {
            Facility.hasMany(models.Doctors, {
                foreignKey: 'facilityId' 
            });
        }
    }

    Facility.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                }
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                validate: {
                    isNumeric: true,
                }
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            mainImage: {
                type: DataTypes.STRING,
                allowNull: true
            },
            subImages: {
                type: DataTypes.JSON,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Facility',
            tableName: 'Facility',
            timestamps: true
        }
    );

    return Facility;
};
