"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Questions.belongsTo(models.Exams, { foreignKey: 'examId', as: 'exam' });
    }
  }
  Questions.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      text: { type: DataTypes.TEXT, allowNull: false },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      optionA: { type: DataTypes.STRING, allowNull: false },
      optionB: { type: DataTypes.STRING, allowNull: false },
      optionC: { type: DataTypes.STRING, allowNull: false },
      optionD: { type: DataTypes.STRING, allowNull: false },
      correctOption: {
        type: DataTypes.ENUM("A", "B", "C", "D"),
        allowNull: false,
      },
      explanation: { type: DataTypes.TEXT, allowNull: true },
      examId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Questions",
      tableName: "questions",
    },
  );
  return Questions;
};
