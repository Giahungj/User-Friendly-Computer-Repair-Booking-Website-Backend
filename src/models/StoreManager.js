'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class StoreManager extends Model {
		static associate(models) {
			StoreManager.belongsTo(models.User, { foreignKey: 'user_id' });
			StoreManager.hasOne(models.Store, { foreignKey: 'store_manager_id' });
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
		}
	}, {
		sequelize,
		modelName: 'StoreManager',
		tableName: 'storemanagers',
		timestamps: true,
	});
	return StoreManager;
};
