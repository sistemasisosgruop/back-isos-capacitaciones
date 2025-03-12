'use strict';

const { TRABAJADOR_TABLE } = require('../models/trabajador.model');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(TRABAJADOR_TABLE, 'actualizado_fecha_caducidad', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
    await queryInterface.addColumn(TRABAJADOR_TABLE, 'actualizado_fecha_examen', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(TRABAJADOR_TABLE, 'actualizado_fecha_caducidad');
    await queryInterface.removeColumn(TRABAJADOR_TABLE, 'actualizado_fecha_examen');
  }
};