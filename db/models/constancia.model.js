const { Model, DataTypes } = require('sequelize');

class Constancia extends Model {
  static config(sequelize) {
    return {
      sequelize,
      modelName: 'Constancia',
      tableName: 'constancias',
      timestamps: true
    };
  }

  static associate(models) {
    this.belongsTo(models.Trabajador, {
      foreignKey: 'trabajador_id',
      as: 'trabajador'
    });
    this.belongsTo(models.Empresa, {
      foreignKey: 'empresa_id',
      as: 'empresa'
    });
    this.belongsTo(models.Emo, {
      foreignKey: 'emo_id',
      as: 'emo'
    });
  }
}

const ConstanciaSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trabajador_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  emo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serial: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  }
};

module.exports = { Constancia, ConstanciaSchema }; 