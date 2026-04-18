"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exams", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      year: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM("JAMB", "WAEC", "NECO"), allowNull: false },
      subjectId: { type: DataTypes.UUID, allowNull: false },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("exams");
  },
};
