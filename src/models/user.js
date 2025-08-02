'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
		}
	}

	User.init({
		user_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		avatar: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		last_active: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'users',
		timestamps: true,
	});

	return User;
};
