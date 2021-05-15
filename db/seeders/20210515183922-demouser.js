'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('users', [{
      username: 'demouser',
      full_name: 'Demo User',
      email: 'demo@demo.com',
      password: '1111',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
