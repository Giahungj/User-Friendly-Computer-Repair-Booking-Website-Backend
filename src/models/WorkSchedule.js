'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class WorkSchedule extends Model {
		static associate(models) {
			WorkSchedule.belongsTo(models.Technician, {
				foreignKey: 'technician_id'
			});
			WorkSchedule.hasMany(models.RepairBooking, {
				foreignKey: 'work_schedule_id'
			});
		}
	}

	WorkSchedule.init({
		work_schedule_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		technician_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		work_date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		shift: {
			type: DataTypes.ENUM('1', '2'), // 1 = 07-11h, 2 = 13-17h
			allowNull: false
		},
		max_number: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			defaultValue: 0
		},
		current_number: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			defaultValue: 0
		}
	}, {
		sequelize,
		modelName: 'WorkSchedule',
		tableName: 'workschedules',
		timestamps: true
	});

	return WorkSchedule;
};