'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('weeknesses', 'attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    });
    await queryInterface.addColumn('weeknesses', 'aiAnalysis', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('weeknesses', 'lastAttemptDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('weeknesses', 'attempts');
    await queryInterface.removeColumn('weeknesses', 'aiAnalysis');
    await queryInterface.removeColumn('weeknesses', 'lastAttemptDate');
  }
};
