"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questions", {
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questions");
  },
};
