'use strict';

const { TrabajadorSchema, TRABAJADOR_TABLE} = require('./../models/trabajador.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(TRABAJADOR_TABLE, TrabajadorSchema);
  },

  async down (queryInterface) {
    await queryInterface.dropTable(TRABAJADOR_TABLE);
  }
};
