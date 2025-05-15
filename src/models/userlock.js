'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLock extends Model {
    static associate(models) {
      UserLock.belongsTo(models.User, { foreignKey: 'userId', as: 'lockedUser' });
      UserLock.belongsTo(models.User, { foreignKey: 'lockedBy', as: 'admin' });
    }
  }
  UserLock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'userId', // Chỉ định rõ tên cột trong database
      references: {
        model: 'Users', // Tên bảng trong database (thường là số nhiều)
        key: 'id'
      }
    },
    lockedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'lockedBy', // Chỉ định rõ tên cột trong database
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lockReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'lockReason'
    },
    lockStartTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'lockStartTime'
    },
    lockEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lockEndTime'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updatedAt'
    }
  }, {
    sequelize,
    modelName: 'UserLock',
    tableName: 'userlocks',
    underscored: false // Tắt snake_case để khớp với tên cột userId, lockedBy
  });
  return UserLock;
};