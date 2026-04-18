"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class exams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        exams.belongsTo(models.Subjects, { foreignKey: 'subjectId', as: 'subject' });
        exams.hasMany(models.Questions, { foreignKey: 'examId', as: 'questions' });
    }
  }
  exams.init(
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
    {},
    {
      sequelize,
      modelName: "exams",
    },
  );
  return exams;
};
