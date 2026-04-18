'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friendships extends Model {
    static associate(models) {
      Friendships.belongsTo(models.Users, { as: 'user', foreignKey: 'userId' });
      Friendships.belongsTo(models.Users, { as: 'friend', foreignKey: 'friendId' });
    }
  }
  Friendships.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    friendId: { type: DataTypes.UUID, allowNull: false },
    status: DataTypes.ENUM('pending', 'accepted', 'rejected')
  }, {
    sequelize,
    modelName: 'Friendships',
  });
  return Friendships;
};