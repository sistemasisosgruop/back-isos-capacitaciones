'use strict';
const { CapacitadorSchema,CAPACITADOR_TABLE} = require('./../models/capacitador.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(CAPACITADOR_TABLE, CapacitadorSchema);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(CAPACITADOR_TABLE);
  }
};