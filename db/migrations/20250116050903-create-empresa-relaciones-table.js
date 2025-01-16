'use strict';
const { EmpresaRelacionesSchema, EMPRESA_RELACIONES_TABLE } = require('./../models/empresaRelaciones');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(EMPRESA_RELACIONES_TABLE, EmpresaRelacionesSchema);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(EMPRESA_RELACIONES_TABLE);
  }
};
