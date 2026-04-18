'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Drop existing Friendships table if it exists
    await queryInterface.dropTable('Friendships');
    
    // 2. Re-create Friendships table correctly
    await queryInterface.createTable('Friendships', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      friendId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 3. Create Challenges table
    await queryInterface.createTable('Challenges', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      challengerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      challengedId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      topic: { type: Sequelize.STRING },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'completed', 'declined'),
        defaultValue: 'pending'
      },
      challengerScore: { type: Sequelize.INTEGER, defaultValue: 0 },
      challengedScore: { type: Sequelize.INTEGER, defaultValue: 0 },
      winnerId: { type: Sequelize.UUID, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Challenges');
    await queryInterface.dropTable('Friendships');
  }
};
