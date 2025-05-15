'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Medicines extends Model {
        static associate(models) {
            // Quan hệ với Prescriptions (mỗi Medicine có thể có nhiều Prescriptions)
            Medicines.hasMany(models.Prescriptions, { foreignKey: 'medicineId' });
        }
    }

    Medicines.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,  // Có thể null vì không bắt buộc phải có mô tả
        },
    }, {
        sequelize,
        modelName: 'Medicines',  // Đảm bảo tên model chính xác
    });

    return Medicines;
};
