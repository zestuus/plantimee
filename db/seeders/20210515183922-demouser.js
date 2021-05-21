'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('111111', salt);

    const users = await queryInterface.bulkInsert('Users', [{
      username: 'demouser',
      full_name: 'Demo User',
      email: 'demo@demo.com',
      password,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    return await queryInterface.bulkInsert('Events', [
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
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        UserId: users[0].id,
        name: 'Task 3',
        description: 'Description 3',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Events', null, {});
  }
};
