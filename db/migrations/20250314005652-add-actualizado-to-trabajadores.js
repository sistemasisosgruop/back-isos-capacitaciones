'use strict';

const { EMO_TABLE } = require('../models/emo.model');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(EMO_TABLE, 'actualizado_fecha_caducidad', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
    await queryInterface.addColumn(EMO_TABLE, 'actualizado_fecha_examen', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(EMO_TABLE, 'actualizado_fecha_caducidad');
    await queryInterface.removeColumn(EMO_TABLE, 'actualizado_fecha_examen');
  }
};