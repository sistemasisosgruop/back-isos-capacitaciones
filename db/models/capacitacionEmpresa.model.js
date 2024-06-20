const { Model, DataTypes, Sequelize } = require('sequelize');

const {EMPRESA_TABLE} = require('./empresa.model');
const { CAPACITACION_TABLE} = require('./capacitacion.model');

const CAPACITACION_EMPRESA_TABLE = 'capacitaciones_empresas';

const CapacitacionEmpresaSchema = {
    id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    empresaId: {
        field: 'empresa_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: EMPRESA_TABLE,
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    capacitacionId: {
        field: 'capacitacion_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: CAPACITACION_TABLE,
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
}

class CapacitacionEmpresa extends Model{
    static associate(models){
        //
        this.belongsToMany(models.Empresa, {
            through: models.CapacitacionEmpresa,
            foreignKey: 'capacitacionId',
          });
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: CAPACITACION_EMPRESA_TABLE,
            modelName: 'CapacitacionEmpresa',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {CAPACITACION_EMPRESA_TABLE, CapacitacionEmpresa, CapacitacionEmpresaSchema}