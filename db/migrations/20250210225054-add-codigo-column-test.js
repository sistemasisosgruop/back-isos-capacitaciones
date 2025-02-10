'use strict';

const { TEST_TABLE } = require('../models/test.model');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TEST_TABLE, 'codigo', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: 'TEST-001'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(TEST_TABLE, 'codigo');
  }
};