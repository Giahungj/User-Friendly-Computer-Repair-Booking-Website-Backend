'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Specialty extends Model {
		static associate(models) {
			Specialty.belongsToMany(models.Technician, {
				through: models.TechnicianSpecialty,
				foreignKey: 'specialty_id',
				otherKey: 'technician_id'
			});
		}
	}
	Specialty.init({
		specialty_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		image: {
			type: DataTypes.STRING(255),
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
		modelName: 'Specialty',
		tableName: 'specialties',
		timestamps: true
	});
	return Specialty;
};
