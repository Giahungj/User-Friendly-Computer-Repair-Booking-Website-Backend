'use strict';
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Doctors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      infor: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      experience: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER,
        unique: true,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      specialtyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Specialty',
          key: 'id'
        }
      },
      facilityId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Facility',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Doctors');
  }
};