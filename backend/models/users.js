'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Users.hasMany(models.Message, { as: 'sentMessages', foreignKey: 'senderId' });
      Users.hasMany(models.Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
    }
  }
  Users.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    fullname: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    parentEmail: DataTypes.STRING,
    password: DataTypes.STRING,
    points: DataTypes.INTEGER,
    streak: { type: DataTypes.INTEGER, defaultValue: 0 },
    examsTaken: { type: DataTypes.INTEGER, defaultValue: 0 },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastStudyDate: DataTypes.DATE,
    examDate: DataTypes.DATE,
    targetScore: { type: DataTypes.INTEGER, defaultValue: 280 }
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};