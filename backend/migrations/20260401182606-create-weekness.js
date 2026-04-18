"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("weeknesses", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      severity: {
        type: DataTypes.ENUM("low", "moderate", "high"),
        defaultValue: "low",
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("weeknesses");
  },
};
