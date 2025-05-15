'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PendingDoctors extends Model {}

    PendingDoctors.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            dateofbirth: {
                allowNull: false,
                type: DataTypes.DATE
              },
            sex: {
                type: DataTypes.TINYINT(1),
                allowNull: false,
                defaultValue: 0,
            },
            userType: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            infor: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            experience: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            facilityId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            specialtyId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            avatar: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0.0,
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
        },
        {
            sequelize,
            modelName: 'PendingDoctors',
            tableName: 'pendingdoctors',
            timestamps: false,
        }
    );

    return PendingDoctors;
};