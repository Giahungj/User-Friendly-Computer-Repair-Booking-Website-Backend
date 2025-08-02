'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class RepairHistory extends Model {
		static associate(models) {
			RepairHistory.belongsTo(models.RepairBooking, { foreignKey: 'booking_id' });
		}
	}

	RepairHistory.init({
		history_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		booking_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		status: {
			type: DataTypes.ENUM('completed', 'rejected'),
			allowNull: false
		},
		completion_notes: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		rejection_reason: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		action_date: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		}
	}, {
		sequelize,
		modelName: 'RepairHistory',
		tableName: 'repairhistory',
		timestamps: true,
	});

	return RepairHistory;
};
