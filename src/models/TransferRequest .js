'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class TransferRequest extends Model {
		static associate(models) {
			// ví dụ liên kết nếu sau này cần
			// TransferRequest.belongsTo(models.Technician, { foreignKey: 'technician_id' });
			// TransferRequest.belongsTo(models.Store, { foreignKey: 'from_store_id', as: 'fromStore' });
			// TransferRequest.belongsTo(models.Store, { foreignKey: 'to_store_id', as: 'toStore' });
			// TransferRequest.belongsTo(models.Admin, { foreignKey: 'admin_id' });
			// TransferRequest.belongsTo(models.StoreManager, { foreignKey: 'store_manager_id' });
		}
	}

	TransferRequest.init({
		transfer_request_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		technician_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		store_manager_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		from_store_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		to_store_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		reason: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		status: {
			type: DataTypes.ENUM('pending', 'approved', 'rejected'),
			defaultValue: 'pending'
		},
		admin_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		processed_at: {
			type: DataTypes.DATE,
			allowNull: true
		},
		note: {
			type: DataTypes.TEXT,
			allowNull: true
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
		modelName: 'TransferRequest',
		tableName: 'transfer_request',
		timestamps: true
	});

	return TransferRequest;
};
