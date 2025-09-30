"use strict";
const { EmpresaTrabajadorSchema, EMPRESA_TRABAJADOR_TABLE } = require('../models/empresaTrabajador.model');


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(EMPRESA_TRABAJADOR_TABLE, EmpresaTrabajadorSchema);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(EMPRESA_TRABAJADOR_TABLE);
  },
};
