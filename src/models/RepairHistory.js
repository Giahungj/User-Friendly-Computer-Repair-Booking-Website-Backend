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
			type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
			allowNull: false
		},
		notes: {                  // thay completion_notes & rejection_reason
			type: DataTypes.TEXT,  // ghi chú chung: lý do hủy, hoàn thành, vv.
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
