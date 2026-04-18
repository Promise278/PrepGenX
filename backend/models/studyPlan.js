'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudyPlan extends Model {
    static associate(models) {
      StudyPlan.belongsTo(models.Users, { foreignKey: 'userId' });
    }
  }
  StudyPlan.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    planData: { type: DataTypes.JSON, allowNull: false }, // Store the AI generated plan JSON
    startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    endDate: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('active', 'completed', 'archived'), defaultValue: 'active' }
  }, {
    sequelize,
    modelName: 'StudyPlan',
  });
  return StudyPlan;
};
