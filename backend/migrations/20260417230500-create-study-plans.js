'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StudyPlans', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      planData: {
        type: Sequelize.JSON,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      endDate: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'archived'),
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StudyPlans');
  }
};
