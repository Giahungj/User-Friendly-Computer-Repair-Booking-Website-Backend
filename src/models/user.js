'use strict';
import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasOne(models.Customer, { foreignKey: 'user_id' });
			User.hasOne(models.Technician, { foreignKey: 'user_id' });
			User.hasOne(models.Admin, { foreignKey: 'user_id' });
			User.hasOne(models.StoreManager, { foreignKey: 'user_id' });
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
		role: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		phone: DataTypes.STRING(20),
		avatar: DataTypes.STRING(255),
		last_active: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'users',
		timestamps: true
	});

	return User;
};
