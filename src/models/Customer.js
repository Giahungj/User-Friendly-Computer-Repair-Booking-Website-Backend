'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Customer extends Model {
		static associate(models) {
			Customer.belongsTo(models.User, {
				foreignKey: 'user_id',
				targetKey: 'user_id'
			});
		}
	}

	Customer.init({
		customer_id: {
			type: DataTypes.INTEGER,
		 autoIncrement: true,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		address: DataTypes.STRING,
		date_of_birth: DataTypes.DATEONLY,
		preferred_contact: DataTypes.STRING,
		loyalty_points: DataTypes.INTEGER,
	}, {
		sequelize,
		modelName: 'Customer',
		tableName: 'customers',
		timestamps: true,
	});

	return Customer;
};
