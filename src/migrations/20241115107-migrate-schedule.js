'use strict';
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Schedule', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      currentNumber: {
        type: Sequelize.INTEGER
      },
      maxNumber: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY
      },
      doctorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Doctor',
          key: 'id'
        }
      },
      timeSlotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Timeslot',
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
    await queryInterface.dropTable('Schedule');
  }
};