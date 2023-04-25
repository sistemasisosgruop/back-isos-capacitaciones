'use strict';

const { CAPACITACION_TABLE, CapacitacionSchema } = require('../models/capacitacion.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    
    //await queryInterface.addColumn(CAPACITACION_TABLE, 'fechaAplazo', CapacitacionSchema.fechaAplazo);
    //await queryInterface.addColumn(CAPACITACION_TABLE, 'horas', CapacitacionSchema.horas);
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
  }
};
