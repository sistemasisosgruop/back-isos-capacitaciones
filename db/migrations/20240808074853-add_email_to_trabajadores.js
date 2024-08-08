'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('trabajadores', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });

    // await queryInterface.sequelize.query('ALTER TABLE trabajadores ADD COLUMN email;');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('trabajadores', 'email');
  }
};
