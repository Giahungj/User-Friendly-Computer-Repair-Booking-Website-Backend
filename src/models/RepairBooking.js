'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class RepairBooking extends Model {
		static associate(models) {
			RepairBooking.belongsTo(models.Customer, {
				foreignKey: 'customer_id'
			});
			RepairBooking.belongsTo(models.WorkSchedule, {
				foreignKey: 'work_schedule_id'
			});
			RepairBooking.hasMany(models.RepairHistory, {
				foreignKey: 'booking_id'
			});
		}
	}

	RepairBooking.init({
		booking_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		customer_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		work_schedule_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		device_type: {
			type: DataTypes.ENUM('Laptop', 'PC', 'Máy in', 'Điện thoại'),
			allowNull: false
		},
		brand: DataTypes.STRING(50),
		model: DataTypes.STRING(100),
		issue_description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		booking_date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		booking_time: {
			type: DataTypes.TIME,
			allowNull: false
		},
		status: {
			type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
			defaultValue: 'pending'
		},
		issue_image: DataTypes.STRING(255)
	}, {
		sequelize,
		modelName: 'RepairBooking',
		tableName: 'repairbookings',
		timestamps: true
	});

	return RepairBooking;
};
