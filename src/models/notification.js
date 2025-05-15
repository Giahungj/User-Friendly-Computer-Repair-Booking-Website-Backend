"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User);
        }
    }

    Notification.init(
        {
            userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
            message: { type: DataTypes.STRING, allowNull: false },
            action: { type: DataTypes.STRING, allowNull: true },
            isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, modelName: "Notification", tableName: "Notifications" }
    );

    return Notification;
};
