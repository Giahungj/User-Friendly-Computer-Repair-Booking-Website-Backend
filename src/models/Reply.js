'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Reply extends Model {
		static associate(models) {
			// 🔗 Mỗi reply thuộc về một rating
			Reply.belongsTo(models.Rating, { foreignKey: 'rating_id' });

			// 🔗 Mỗi reply được gửi bởi một người quản lý
			Reply.belongsTo(models.User, { foreignKey: 'manager_id' });
		}
	}

	Reply.init(
		{
			reply_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			rating_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			manager_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			visible: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			modelName: 'Reply',
			tableName: 'replies',
			timestamps: true,
		}
	);

	return Reply;
};
