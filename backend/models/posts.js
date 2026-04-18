'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    static associate(models) {
      Posts.belongsTo(models.Users, { foreignKey: 'userId', as: 'author' });
      Posts.hasMany(models.Comments, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
    }
  }
  Posts.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'Posts',
  });
  return Posts;
};
