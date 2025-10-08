'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Notification extends Model {
		static associate(models) {
			Notification.belongsTo(models.User, {
				foreignKey: 'user_id'
			});
		}
	}

	Notification.init({
		notification_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		message: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		action: {
			type: DataTypes.STRING(255)
		},
		is_read: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		}
	}, {
		sequelize,
		modelName: 'Notification',
		tableName: 'notifications',
		timestamps: true
	});

	return Notification;
};
