'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Weaknesses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Weaknesses.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
      Weaknesses.belongsTo(models.Subjects, { foreignKey: 'subjectId', as: 'subject' });
    }
  }
  Weaknesses.init({
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    severity: {
      type: DataTypes.ENUM('low', 'moderate', 'high'),
      defaultValue: 'low'
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    aiAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastAttemptDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Weaknesses',
    tableName: 'weeknesses',
  });
  return Weaknesses;
};