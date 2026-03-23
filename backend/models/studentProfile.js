'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentProfile extends Model {
    static associate(models) {
      StudentProfile.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  StudentProfile.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    classLevel: {
      type: DataTypes.ENUM('SS1', 'SS2', 'SS3', 'Other'),
      allowNull: true
    },
    examType: {
      type: DataTypes.ENUM('JAMB', 'WAEC', 'NECO', 'Multiple'),
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'StudentProfile',
  });
  
  return StudentProfile;
};
