'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Admin extends Model {
		static associate(models) {
			Admin.belongsTo(models.User, {
				foreignKey: 'user_id',
				as: 'user'
			});
		}
	}

	Admin.init({
		admin_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		role_level: {
			type: DataTypes.ENUM('super', 'moderator'),
			allowNull: true,
			defaultValue: 'moderator'
		},
		permissions: {
			type: DataTypes.TEXT('long'),
			allowNull: true
		},
		last_login: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		department: {
			type: DataTypes.STRING(100),
			allowNull: true
		}
	}, {
		sequelize,
		modelName: 'Admin',
		tableName: 'admins',
		timestamps: true,
	});

	return Admin;
};
