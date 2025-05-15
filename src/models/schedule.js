'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Schedule extends Model {
        static associate(models) {
            // Schedule liên kết với Doctor và Timeslot
            Schedule.belongsTo(models.Doctors, { foreignKey: "doctorId" });
            Schedule.belongsTo(models.Timeslot);

            // Schedule liên kết với Booking
            Schedule.hasMany(models.Booking);
        }
    };
    Schedule.init({
        currentNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        maxNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        timeSlotId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        error: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Schedule',
        tableName: 'schedule',
        freezeTableName: true
    });
    return Schedule;
};
