'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar la columna codigo
    await queryInterface.addColumn('capacitaciones', 'codigo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'CAP000000-0' // valor temporal
    });

    // Obtener todas las capacitaciones
    const capacitaciones = await queryInterface.sequelize.query(
      'SELECT * FROM capacitaciones',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Actualizar cada capacitación con su código
    for (const capacitacion of capacitaciones) {
      const fecha = new Date(capacitacion.fechaInicio);
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const id = String(capacitacion.id).padStart(4, '0');
      const codigo = `CAP${año}${mes}-${id}`;

      await queryInterface.sequelize.query(
        `UPDATE capacitaciones SET codigo = :codigo WHERE id = :id`,
        {
          replacements: { codigo, id: capacitacion.id }
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('capacitaciones', 'codigo');
  }
};