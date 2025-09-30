'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // Migrar los datos existentes desde trabajadores a la tabla intermedia
   await queryInterface.sequelize.query(`
      INSERT INTO empresa_trabajador ("empresaId", "trabajadorId", "fechaIngreso")
      SELECT empresa_id, id, NOW() FROM trabajadores WHERE empresa_id IS NOT NULL;
    `);

    // Eliminar la columna empresaId de la tabla trabajadores
    await queryInterface.removeColumn('trabajadores', 'empresa_id');
  },

  async down (queryInterface, Sequelize) {
    // Restaurar la columna empresaId en trabajadores en caso de rollback
    await queryInterface.addColumn('trabajadores', 'empresa_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'empresas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

   
  }
};
