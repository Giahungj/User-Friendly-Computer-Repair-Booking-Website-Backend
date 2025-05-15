'use strict';
export default {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Rating', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Doctor',
                    key: 'id'
                }
            },
            patientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Patient',
                    key: 'id'
                }
            },
            score: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
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
        await queryInterface.dropTable('Rating');
    }
};
