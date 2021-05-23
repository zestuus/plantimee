'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('111111', salt);

    const start_time = new Date();
    const end_time = new Date();
    const start_time2 = new Date();
    const end_time2 = new Date();
    const start_time3 = new Date();
    const end_time3 = new Date();

    start_time.setTime(start_time.getTime() + 60*60*1000)
    end_time.setTime(end_time.getTime() + 2*60*60*1000)
    start_time2.setTime(start_time2.getTime() + 3*60*60*1000)
    end_time2.setTime(end_time2.getTime() + 4*60*60*1000)
    start_time3.setTime(start_time3.getTime() + 2.5*60*60*1000)
    end_time3.setTime(end_time3.getTime() + 6*60*60*1000)

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
        start_time: start_time3,
        end_time: end_time3,
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
        start_time,
        end_time,
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
        start_time: start_time2,
        end_time: end_time2,
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
