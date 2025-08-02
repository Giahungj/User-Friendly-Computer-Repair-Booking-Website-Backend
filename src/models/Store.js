'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Store extends Model {
		static associate(models) {
			Store.hasMany(models.Technician, { foreignKey: 'store_id' });
			Store.hasOne(models.StoreManager, { foreignKey: 'store_id' });
		}
	}

	Store.init({
		store_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		manager_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: 'storemanagers',
				key: 'storemanager_id'
			}
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		store_image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		sequelize,
		modelName: 'Store',
		tableName: 'stores',
		timestamps: true
	});

	return Store;
};
