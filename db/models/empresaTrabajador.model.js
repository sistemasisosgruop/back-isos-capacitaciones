const { Model, DataTypes } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresa.model');
const { TRABAJADOR_TABLE } = require('./trabajador.model');

const EMPRESA_TRABAJADOR_TABLE = 'empresa_trabajador';

const EmpresaTrabajadorSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  empresaId: {
    type: DataTypes.INTEGER,
    references: {
      model: EMPRESA_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  trabajadorId: {
    type: DataTypes.INTEGER,
    references: {
      model: TRABAJADOR_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  fechaIngreso: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
};

class EmpresaTrabajador extends Model {
  static associate(models) {
    this.belongsTo(models.Empresa, { foreignKey: 'empresaId' });
    this.belongsTo(models.Trabajador, { foreignKey: 'trabajadorId' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EMPRESA_TRABAJADOR_TABLE,
      modelName: 'EmpresaTrabajador',
      timestamps: false,
    };
  }
}

module.exports = { EMPRESA_TRABAJADOR_TABLE, EmpresaTrabajadorSchema, EmpresaTrabajador };
