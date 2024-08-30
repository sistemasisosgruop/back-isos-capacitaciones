const { Model, DataTypes, Sequelize } = require("sequelize");
const { TRABAJADOR_TABLE } = require("./trabajador.model");

const REGISTRO_DESCARGA_TABLE = "registroDescarga";

const RegistroDescargaSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  trabajador_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  fecha: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  hora: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  tipo: {
    allowNull: false,
    type: DataTypes.STRING,
  },
};

class RegistroDescarga extends Model {
  static associate(models) {
    this.belongsTo(models.Trabajador, {
      foreignKey: "trabajador_id",
      targetKey: "id",
      as: "trabajador",
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: REGISTRO_DESCARGA_TABLE,
      modelName: "registroDescarga",
      timestamps: false,
      updatedAt: false,
      deletedAt: false,
    };
  }
}

module.exports = {
  REGISTRO_DESCARGA_TABLE,
  RegistroDescargaSchema,
  RegistroDescarga,
};
