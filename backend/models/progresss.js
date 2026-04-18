'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Progresss extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Progresss.belongsTo(models.Users, { foreignKey: 'userId' });
      Progresss.belongsTo(models.Subjects, { foreignKey: 'subjectId' });
    }
  }
  Progresss.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    difficultyLevel: DataTypes.ENUM('easy', 'medium', 'hard'),
    score: DataTypes.INTEGER,
    userId: DataTypes.UUID,
    subjectId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Progresss',
  });
  return Progresss;
};