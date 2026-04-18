'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Challenges extends Model {
    static associate(models) {
      Challenges.belongsTo(models.Users, { as: 'challenger', foreignKey: 'challengerId' });
      Challenges.belongsTo(models.Users, { as: 'challenged', foreignKey: 'challengedId' });
    }
  }
  Challenges.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    challengerId: { type: DataTypes.UUID, allowNull: false },
    challengedId: { type: DataTypes.UUID, allowNull: false },
    subjectId: { type: DataTypes.UUID, allowNull: true },
    topic: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'completed', 'declined'),
      defaultValue: 'pending'
    },
    challengerScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    challengedScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    winnerId: { type: DataTypes.UUID, allowNull: true }
  }, {
    sequelize,
    modelName: 'Challenges',
  });
  return Challenges;
};
