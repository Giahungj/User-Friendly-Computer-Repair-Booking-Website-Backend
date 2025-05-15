'use strict';
const { BOOLEAN } = require('sequelize');
const { Model } = require('sequelize');
const specialty = require('./specialty');

module.exports = (sequelize, DataTypes) => {
  class Doctors extends Model {

    static associate(models) {
      // define associations here
      Doctors.belongsTo(models.User);
      Doctors.hasMany(models.Schedule, { foreignKey: "doctorId" });
      Doctors.belongsTo(models.Specialty);
      Doctors.belongsTo(models.Facility);
      Doctors.hasMany(models.Rating);
      Doctors.hasMany(models.DoctorPayments);
        Doctors.hasMany(models.DoctorService, { foreignKey: "doctorId" }); // Lưu ý tên model đúng
    }
  };

  Doctors.init({
    infor: DataTypes.STRING,
    price: DataTypes.FLOAT,
    experience: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER,
    facilityId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Doctors',
    tableName: 'doctors',
  });

  return Doctors;
};
