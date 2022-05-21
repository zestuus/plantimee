'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      completed: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      isFullDay: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      isGuestListPublic: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8)
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8)
      },
      placeName: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      googleId: {
        type: Sequelize.STRING
      },
      googleCalendarId: {
        type: Sequelize.STRING
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
  down: async (queryInterface) => {
    await queryInterface.dropTable('Events');
  }
};