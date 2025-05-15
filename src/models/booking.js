'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Patient, { foreignKey: 'patientId' });
      Booking.hasMany(models.DoctorPayments);
      Booking.belongsTo(models.Schedule, { foreignKey: 'scheduleId' });
      Booking.hasOne(models.History, { foreignKey: 'bookingId' });
      Booking.hasMany(models.Prescriptions, { foreignKey: 'bookingId' });
      // Quan hệ với Rating
      Booking.hasOne(models.Rating, { foreignKey: 'bookingId' });
    }
  }

  Booking.init({
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true 
    },
    patientId: {
      type: DataTypes.INTEGER
    },
    scheduleId: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Booking'
  });

  return Booking;
};