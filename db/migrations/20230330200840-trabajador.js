'use strict';
const { UsuarioSchema, USUARIO_TABLE } = require('./../models/usuario.model');
const { TrabajadorSchema, TRABAJADOR_TABLE} = require('./../models/trabajador.model');
const { ADMINISTRADOR_TABLE, AdministradorSchema } = require('../models/administrador.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    
    await queryInterface.createTable(USUARIO_TABLE, UsuarioSchema);
    await queryInterface.createTable(TRABAJADOR_TABLE, TrabajadorSchema);
    await queryInterface.createTable(ADMINISTRADOR_TABLE, AdministradorSchema);
    
  },

  async down (queryInterface) {
    await queryInterface.dropTable(TRABAJADOR_TABLE);
    await queryInterface.dropTable(ADMINISTRADOR_TABLE);
    await queryInterface.dropTable(USUARIO_TABLE);
  }
};
