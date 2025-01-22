'use strict';
const { EmpresaTrabajadorSchema, EMPRESA_RELACIONES_TABLE } = require('../models/empresaRelaciones.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(EMPRESA_RELACIONES_TABLE, EmpresaTrabajadorSchema);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(EMPRESA_RELACIONES_TABLE);
  }
};
