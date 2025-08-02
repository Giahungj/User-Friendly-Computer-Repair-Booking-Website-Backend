'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class TechnicianSpecialty extends Model {
		static associate(models) {
			// Nếu cần liên kết, thêm ở đây
		}
	}

	TechnicianSpecialty.init({
		technician_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			primaryKey: true
		},
		specialty_id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		}
	}, {
		sequelize,
		modelName: 'TechnicianSpecialty',
		tableName: 'technician_specialty',
		timestamps: true,
	});

	return TechnicianSpecialty;
};
