const { Model, DataTypes, Sequelize } = require('sequelize');

const USUARIO_TABLE = 'usuarios';

const UsuarioSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  username: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  contraseña: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rol: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'Trabajador'
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'create_at',
    defaultValue: Sequelize.NOW
  }
}

class Usuario extends Model {
  static associate(models) {
    /*this.hasOne(models.Customer, {
      as: 'customer',
      foreignKey: 'userId'
    });*/
    this.hasOne(models.Trabajador,{
        as: 'trabajador',
        foreignKey: 'userId'
    });
    this.hasOne(models.Administrador,{
        as: 'administrador',
        foreignKey: 'userId'
    })
    this.hasOne(models.Capacitador,{
        as: 'capacitador',
        foreignKey: 'userId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIO_TABLE,
      modelName: 'Usuario',
      timestamps: false,
      updatedAt: false,
      deletedAt: false,
    }
  }
}


module.exports = { USUARIO_TABLE, UsuarioSchema, Usuario }