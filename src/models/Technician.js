'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Technician extends Model {
		static associate(models) {
			Technician.belongsTo(models.User, {
				foreignKey: 'user_id'
			});
			Technician.belongsTo(models.Store, {
				foreignKey: 'store_id'
			});
			Technician.hasMany(models.WorkSchedule, {
				foreignKey: 'technician_id'
			});
			Technician.belongsToMany(models.Specialty, {
				through: models.TechnicianSpecialty,
				foreignKey: 'technician_id',
				otherKey: 'specialty_id'
			});
			Technician.hasMany(models.Rating, {
				foreignKey: 'technician_id',
				onDelete: 'CASCADE'
			});
		}
	}
	Technician.init({
		technician_id: {
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
		modelName: 'Technician',
		tableName: 'technicians',
		timestamps: true,
	});
	return Technician;
};