const { Model, DataTypes, Sequelize } = require('sequelize');

const EMPRESA_TABLE = 'empresas';

const EmpresaSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    nombreEmpresa:{
        allowNull: false,
        type: DataTypes.STRING
    },
    direccion:{
        allowNull: false,
        type: DataTypes.STRING
    },
    nombreGerente:{
        allowNull: false,
        type: DataTypes.STRING
    },
    numeroContacto:{
        allowNull: false,
        type: DataTypes.STRING
    },
    imagenLogo:{
        allowNull: false,
        type: DataTypes.STRING
    },
    imagenCertificado:{
        allowNull: false,
        type: DataTypes.STRING
    },
    RUC:{
        allowNull: false,
        type: DataTypes.STRING
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    }
}

class Empresa extends Model{
    static associate(models){
        this.hasMany(models.Trabajador, {
            as: 'trabajadores',
            foreignKey: 'empresaId'
        })
        this.belongsToMany(models.Test,{
            through: models.TestEmpresa,
            foreignKey: 'empresaId' 
        })
        this.belongsToMany(models.Capacitacion, {
            through: models.CapacitacionEmpresa,
            foreignKey: 'empresaId',
        });
        this.belongsToMany(models.Empresa, {
            as: 'relacionadas',
            through: models.EmpresaRelaciones,
            foreignKey: 'empresaId',
            otherKey: 'relacionadaConEmpresaId'
        });
        this.belongsToMany(models.Trabajador, {
            as: "trabajadores_empresas",
            through: models.EmpresaTrabajador, 
            foreignKey: "empresaId",
            otherKey: "trabajadorId",
          });
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: EMPRESA_TABLE,
            modelName: 'Empresa',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {EMPRESA_TABLE,Empresa, EmpresaSchema}