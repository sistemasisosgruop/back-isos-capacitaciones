'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('reportes', 'fecha_examen', {
      type: DataTypes.DATE(6), // TIMESTAMP with microseconds precision
      defaultValue: DataTypes.NOW,
      allowNull: true  // Primero permitimos null
    });

    // Actualizamos los registros existentes con la fecha actual
    await queryInterface.sequelize.query(
      `UPDATE reportes SET fecha_examen = CURRENT_TIMESTAMP WHERE fecha_examen IS NULL`
    );

    // Después cambiamos la columna a not null
    await queryInterface.changeColumn('reportes', 'fecha_examen', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: DataTypes.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('reportes', 'fecha_examen');
  }
};