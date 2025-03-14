const { Model, DataTypes, Sequelize } = require('sequelize');
const { TRABAJADOR_TABLE } = require('./trabajador.model');
const { boolean } = require("joi");

const EMO_TABLE = 'emo';

const EmoSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  fecha_examen: {
    type: DataTypes.STRING,
  },
  condicion_aptitud: {
    type: DataTypes.STRING
  },
  clinica: {
    type: DataTypes.STRING,
  },
  fecha_lectura: {
    type: DataTypes.STRING,
  },
  fecha_vencimiento: {
    type: DataTypes.STRING,
  },
  estado_email: {
    type: DataTypes.STRING,
  },
  fecha_email: {
    type: DataTypes.STRING,
  },
  estado_whatsapp: {
    type: DataTypes.STRING,
  },
  fecha_whatsapp: {
    type: DataTypes.STRING,
  },
  estado_emo: {
    type: DataTypes.STRING,
  },
  fecha_emo: {
    type: DataTypes.STRING,
  },
  estado_emo_whatsapp: {
    type: DataTypes.STRING,
  },
  fecha_emo_whatsapp: {
    type: DataTypes.STRING,
  },
  estado: {
    type: DataTypes.STRING,
  },
  controles: {
    type: DataTypes.TEXT,
  },
  recomendaciones: {
    type: DataTypes.TEXT,
  },
  actualizado_fecha_caducidad: {
    type: boolean,
    defaultValue: false,
  },
  actualizado_fecha_examen: {
    type: boolean,
    defaultValue: false,
  },
  trabajadorId:{
    allowNull: false,
    type: DataTypes.STRING,
    references: {
    model: TRABAJADOR_TABLE,
    key: 'dni'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
},
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'create_at',
    defaultValue: Sequelize.NOW
  }
}

class Emo extends Model {
  static associate(models) {

    this.belongsTo(models.Trabajador,{
        as: 'trabajador',
        foreignKey: 'trabajadorId',
        targetKey: 'dni'
    });

  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EMO_TABLE,
      modelName: 'Emo',
      timestamps: false,
      updatedAt: false,
      deletedAt: false,
    }
  }
}


module.exports = { EMO_TABLE, EmoSchema, Emo }