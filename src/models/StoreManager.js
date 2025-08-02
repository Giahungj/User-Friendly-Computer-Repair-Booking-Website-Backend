'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class StoreManager extends Model {
		static associate(models) {
			StoreManager.belongsTo(models.User, { foreignKey: 'user_id' });
			StoreManager.belongsTo(models.Store, { foreignKey: 'store_id' });
		}
	}
	StoreManager.init({
		store_manager_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'StoreManager',
		tableName: 'storemanagers',
		timestamps: true,
	});
	return StoreManager;
};
