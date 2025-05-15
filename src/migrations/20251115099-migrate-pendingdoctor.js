'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pendingdoctors', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sex: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0, // 0: Nam, 1: Nữ
      },
      dateofbirth: {
        allowNull: false,
        type: Sequelize.DATE
      },
      userType: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      infor: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      experience: {
        type: Sequelize.STRING(255),
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
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pendingdoctors');
  },
};
