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
    await queryInterface.addColumn('emo', 'controles', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'recomendaciones', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ''
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('emo', 'controles');
    await queryInterface.removeColumn('emo', 'recomendaciones');
  }
};
