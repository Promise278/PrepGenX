"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Exams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Exams.belongsTo(models.Subjects, { foreignKey: 'subjectId', as: 'subject' });
        Exams.hasMany(models.Questions, { foreignKey: 'examId', as: 'questions' });
    }
  }
  Exams.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      year: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM("JAMB", "WAEC", "NECO"), allowNull: false },
      subjectId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Exams",
      tableName: "exams",
    },
  );
  return Exams;
};
