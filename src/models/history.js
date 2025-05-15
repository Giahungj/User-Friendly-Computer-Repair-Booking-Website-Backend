'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.Booking, { foreignKey: 'bookingId' });
      History.hasMany(models.DoctorPayments);

    }
  };
  History.init({
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revisitDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    conditionAssessment: {
      type: DataTypes.TEXT,
      allowNull: false
    }
    // createdAt và updatedAt không cần khai báo vì Sequelize tự động quản lý
  }, {
    sequelize,
    modelName: 'History'
  });
  return History;
};