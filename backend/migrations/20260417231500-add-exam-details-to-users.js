'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'examDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'targetScore', {
      type: Sequelize.INTEGER,
      defaultValue: 280
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'examDate');
    await queryInterface.removeColumn('Users', 'targetScore');
  }
};
