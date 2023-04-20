const { Model, DataTypes, Sequelize } = require('sequelize');
const { CAPACITACION_TABLE } = require('./capacitacion.model');

const EXAMEN_TABLE = 'examenes'

const ExamenSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechadeExamen:{
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  createdAt:{
      allowNull: false,
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: Sequelize.NOW
  },
  capacitacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CAPACITACION_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}

class Examen extends Model{
  static associate(models){
    this.belongsTo(models.Capacitacion, {
      foreignKey: 'capacitacionId',
      as: 'capacitacion'
    });
    this.hasMany(models.Pregunta,{
        foreignKey: 'examenId',
        as: 'pregunta'
    });
    this.hasOne(models.Reporte,{
      as: 'reporte',
      foreignKey: 'examenId'
  });
  }

  static config(sequelize){
    return{
      sequelize,
      tableName: EXAMEN_TABLE,
      modelName: 'Examen',
      timestamps: false,
      updatedAt: false,
      deletedAt: false,
    }
  }

  async createPregunta(preguntaData) {
    try {
      const pregunta = await this.sequelize.models.Pregunta.create(preguntaData);
      return pregunta;
    } catch (error) {
      console.error(error);
      throw new Error('No se pudo crear la pregunta');
    }
  }
  
}

module.exports = { EXAMEN_TABLE, Examen, ExamenSchema };