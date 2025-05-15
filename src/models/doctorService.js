'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DoctorService extends Model {
        static associate(models) {
            DoctorService.belongsTo(models.Doctors, { foreignKey: 'doctorId' });
            DoctorService.belongsTo(models.Service, { foreignKey: 'serviceId' });
        }
    }

    DoctorService.init({
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("active", "expired", "pending"),
            defaultValue: "pending",
        },
        schedulecount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'DoctorService',
        tableName: 'doctorServices',
        timestamps: false,
    });

    return DoctorService;
};
