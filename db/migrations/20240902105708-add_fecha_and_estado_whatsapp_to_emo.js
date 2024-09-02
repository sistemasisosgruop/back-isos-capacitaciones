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
    await queryInterface.addColumn('emo', 'estado_emo_whatsapp', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'fecha_emo_whatsapp', {
      type: Sequelize.STRING,
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
    await queryInterface.removeColumn('emo', 'estado_emo_whatsapp');
    await queryInterface.removeColumn('emo', 'fecha_emo_whatsapp');
  }
};
