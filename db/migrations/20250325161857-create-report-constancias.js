'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('constancias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      emo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'emo',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      trabajador_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'trabajadores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      serial: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hora: {
        type: Sequelize.TIME,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índice compuesto para manejar el serial
    await queryInterface.addIndex('constancias', ['trabajador_id', 'empresa_id'], {
      name: 'constancias_trabajador_empresa_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('constancias');
  }
};