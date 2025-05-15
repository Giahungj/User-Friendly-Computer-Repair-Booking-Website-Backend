'use strict';
const { BOOLEAN } = require('sequelize');
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Specialty extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Specialty.hasMany(models.Doctors);
        }
    };
    Specialty.init({
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        image: DataTypes.STRING,
        deleted: {  // Thêm trường deleted
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Mặc định là true
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Specialty',
    });
    return Specialty;
};
