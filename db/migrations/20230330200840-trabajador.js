'use strict';
const { UsuarioSchema, USUARIO_TABLE } = require('./../models/user.model');
const { TrabajadorSchema, TRABAJADOR_TABLE} = require('./../models/trabajador.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(USUARIO_TABLE, UsuarioSchema);
    await queryInterface.createTable(TRABAJADOR_TABLE, TrabajadorSchema);
  },

  async down (queryInterface) {
    await queryInterface.dropTable(USUARIO_TABLE)
    await queryInterface.dropTable(TRABAJADOR_TABLE);
  }
};
