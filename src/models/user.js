'use strict';
const { BOOLEAN } = require('sequelize');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Admin);
      User.hasMany(models.Patient);
      User.hasMany(models.Doctors);
      User.hasMany(models.UserLock);
      User.hasMany(models.Notification);
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    dateofbirth: DataTypes.DATE,
    sex: DataTypes.STRING,
    phone: DataTypes.STRING,
    userType: DataTypes.INTEGER,
    avatar: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};