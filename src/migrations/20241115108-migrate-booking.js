'use strict';
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Booking', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY
      },
      patientId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Patient',
          key: 'id'
        }
      },
      scheduleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Schedule',
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
    await queryInterface.dropTable('Booking');
  }
};