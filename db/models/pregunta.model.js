const { Model, DataTypes, Sequelize } = require('sequelize');

const {EXAMEN_TABLE} = require('./examen.model');

const PREGUNTA_TABLE = 'preguntas';

const PreguntaSchema = {
  id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  texto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion2: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion3: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion4: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion5: {
    type: DataTypes.STRING,
    allowNull: false
  },
  respuesta_correcta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  examenId: {
    field: 'examen_id',
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: EXAMEN_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Pregunta extends Model {
  static associate(models) {
    this.belongsTo(models.Examen, { 
        as: 'examen' 
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: PREGUNTA_TABLE,
      modelName: 'Pregunta',
      timestamps: false,
      updatedAt: false,
      deletedAt: false,
    }
  }
}

module.exports = { PREGUNTA_TABLE, Pregunta, PreguntaSchema };