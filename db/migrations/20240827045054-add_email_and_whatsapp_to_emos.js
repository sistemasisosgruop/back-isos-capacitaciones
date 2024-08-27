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
    await queryInterface.addColumn('emo', 'estado_email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'fecha_email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'estado_whatsapp', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'fecha_whatsapp', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('emo', 'estado', {
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
    await queryInterface.removeColumn('emo', 'estado_email');
    await queryInterface.removeColumn('emo', 'fecha_email');
    await queryInterface.removeColumn('emo', 'estado_whatsapp');
    await queryInterface.removeColumn('emo', 'fecha_whatsapp');
    await queryInterface.removeColumn('emo', 'estado');
  }
};
