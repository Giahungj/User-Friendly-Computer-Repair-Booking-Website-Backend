'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoctorPayments extends Model {
    static associate(models) {
      // Định nghĩa quan hệ
      DoctorPayments.belongsTo(models.Doctors);
      DoctorPayments.belongsTo(models.Booking);
      DoctorPayments.belongsTo(models.History);
      DoctorPayments.belongsTo(models.Patient);
    }
  }

  DoctorPayments.init({
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    historyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'DoctorPayments',
    tableName: 'doctorpayments',
    updatedAt: false
  });

  return DoctorPayments;
};