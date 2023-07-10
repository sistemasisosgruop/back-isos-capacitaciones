'use strict';
const { UsuarioSchema, USUARIO_TABLE } = require('./../models/usuario.model');
const { TrabajadorSchema, TRABAJADOR_TABLE} = require('./../models/trabajador.model');
const { ADMINISTRADOR_TABLE, AdministradorSchema } = require('../models/administrador.model');
const { EMPRESA_TABLE, EmpresaSchema } = require('../models/empresa.model');
const { TEST_TABLE, TestSchema } = require('../models/test.model');
const {CAPACITACION_TABLE, CapacitacionSchema} = require('./../models/capacitacion.model');
const { CAPACITACION_EMPRESA_TABLE, CapacitacionEmpresaSchema } = require('../models/capacitacionEmpresa.model');
const {EMO_TABLE, EmoSchema} = require('./../models/emo.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    
    await queryInterface.createTable(USUARIO_TABLE, UsuarioSchema);
    await queryInterface.createTable(EMPRESA_TABLE, EmpresaSchema)
    await queryInterface.createTable(TRABAJADOR_TABLE, TrabajadorSchema);
    await queryInterface.createTable(ADMINISTRADOR_TABLE, AdministradorSchema);
    await queryInterface.createTable(TEST_TABLE, TestSchema);
    await queryInterface.createTable(CAPACITACION_TABLE, CapacitacionSchema);
    await queryInterface.createTable(CAPACITACION_EMPRESA_TABLE, CapacitacionEmpresaSchema);
    await queryInterface.createTable(EMO_TABLE, EmoSchema);
  },

  async down (queryInterface) {
    
    await queryInterface.dropTable(CAPACITACION_EMPRESA_TABLE)
    await queryInterface.dropTable(TRABAJADOR_TABLE);
    await queryInterface.dropTable(ADMINISTRADOR_TABLE);
    await queryInterface.dropTable(USUARIO_TABLE);
    await queryInterface.dropTable(TEST_TABLE);
    await queryInterface.dropTable(EMPRESA_TABLE);
    await queryInterface.dropTable(CAPACITACION_TABLE);
    await queryInterface.dropTable(EMO_TABLE);

  }
};
