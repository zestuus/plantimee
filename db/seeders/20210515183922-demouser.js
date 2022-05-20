'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('111111', salt);

    const startTime = new Date();
    const endTime = new Date();
    const startTime2 = new Date();
    const endTime2 = new Date();
    const startTime3 = new Date();
    const endTime3 = new Date();

    startTime.setTime(startTime.getTime() + 60*60*1000)
    endTime.setTime(endTime.getTime() + 2*60*60*1000)
    startTime2.setTime(startTime2.getTime() + 3*60*60*1000)
    endTime2.setTime(endTime2.getTime() + 4*60*60*1000)
    startTime3.setTime(startTime3.getTime() + 2.5*60*60*1000)
    endTime3.setTime(endTime3.getTime() + 6*60*60*1000)

    const users = await queryInterface.bulkInsert('Users', [
      {
        username: 'demouser',
        full_name: 'Demo User',
        email: 'demo@demo.com',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'demouser2',
        full_name: 'Demo User2',
        email: 'demo2@demo.com',
        password,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const events = await queryInterface.bulkInsert('Events', [
      {
        UserId: users[1].id,
        name: 'Task Invite 1',
        description: 'Description 1',
        startTime: startTime3,
        endTime: endTime3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[1].id,
        name: 'Task Invite 2',
        description: 'Description 2',
        latitude: 47.676792,
        longitude: 19.076234,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 1',
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 2',
        description: 'Description 2',
        startTime,
        endTime,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 3',
        latitude: 47.676792,
        longitude: 19.076234,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 4',
        description: 'Description 4',
        startTime: startTime2,
        endTime: endTime2,
        latitude: 47.676792,
        longitude: 19.076234,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 5',
        description: 'Description 5',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], { returning: true });

    await queryInterface.bulkInsert('Participations', [
      {
        UserId: users[0].id,
        EventId: events[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        EventId: events[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Events', null, {});
  }
};
