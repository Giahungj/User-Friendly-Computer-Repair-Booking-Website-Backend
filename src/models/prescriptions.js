'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Prescriptions extends Model {
        static associate(models) {
            // Quan hệ với BookingPrescription (mỗi Prescription thuộc về một BookingPrescription)
            Prescriptions.belongsTo(models.Booking, { foreignKey: 'bookingId' });
            // Quan hệ với Medicine (mỗi Prescription có một Medicine)
            Prescriptions.belongsTo(models.Medicines, { foreignKey: 'medicineId' });
        }
    }

    Prescriptions.init({
        bookingId: {
            type: DataTypes.INTEGER,
            allowNull: true, // prescriptionId có thể null (do Prescription có thể không có prescriptionId nếu không có đơn thuốc)
        },
        medicineId: {
            type: DataTypes.INTEGER,
            allowNull: false,  // Mỗi Prescription phải có một medicineId
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Prescriptions',  // Đảm bảo tên model chính xác
    });

    return Prescriptions;
};
