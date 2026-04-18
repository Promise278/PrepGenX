'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate(models) {
      Comments.belongsTo(models.Posts, { foreignKey: 'postId', as: 'post' });
      Comments.belongsTo(models.Users, { foreignKey: 'userId', as: 'author' });
    }
  }
  Comments.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    postId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};
