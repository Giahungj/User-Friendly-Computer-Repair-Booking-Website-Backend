'use strict';
const { BOOLEAN } = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    static associate(models) {
      // define association here
      Patient.belongsTo(models.User);
      Patient.hasMany(models.Booking);
      Patient.hasMany(models.DoctorPayments);
      Patient.hasMany(models.Rating);
    }
  };
  Patient.init({
    citizenId: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};