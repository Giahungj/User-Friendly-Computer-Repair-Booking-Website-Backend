'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Rating extends Model {
        static associate(models) {
            Rating.belongsTo(models.Doctors);
            Rating.belongsTo(models.Patient);
            Rating.belongsTo(models.Booking); // Thêm quan hệ với Booking
        }
    }

    Rating.init({
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bookingId: {  // Thêm trường bookingId
            type: DataTypes.INTEGER,
            allowNull: false
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Rating',
    });

    return Rating;
};
