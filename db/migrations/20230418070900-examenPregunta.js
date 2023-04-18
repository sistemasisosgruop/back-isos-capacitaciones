'use strict';

const { EXAMEN_TABLE, ExamenSchema } = require('../models/examen.model');
const { PREGUNTA_TABLE, PreguntaSchema } = require('../models/pregunta.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(EXAMEN_TABLE, ExamenSchema);
    await queryInterface.createTable(PREGUNTA_TABLE, PreguntaSchema);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable(PREGUNTA_TABLE);
    await queryInterface.dropTable(EXAMEN_TABLE)
  }
};
