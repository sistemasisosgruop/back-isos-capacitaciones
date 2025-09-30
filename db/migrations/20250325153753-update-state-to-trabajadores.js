'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('trabajadores', 
      { state_created: false }, 
      {} 
    );
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkUpdate('trabajadores', 
    { state_created: true }, 
    {} 
  );
  }
};
