const { Model, DataTypes, Sequelize } = require('sequelize');

const CAPACITACION_TABLE = 'capacitaciones';

const CapacitacionSchema = {
    id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    nombreCap:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    nombreEmp:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    nombreIns:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    firmaIns:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    examenDoc:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    fechaIni:{
        allowNull: false,
        type: DataTypes.DATEONLY
    },
    fechafin:{
        allowNull: false,
        type: DataTypes.DATEONLY
    },
    fechaFinAplaza:{
        allowNull: false,
        type: DataTypes.DATEONLY
    },
    createdAt:{
        allowNull: falsem,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    }
}

class Capacitacion extends Model{
    static associate(models){
        this.belongsToMany(models.Empresa,{
            through: 'capacitacion_empresa'
        })
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: CAPACITACION_TABLE,
            modelName: 'Capacitacion',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {CAPACITACION_TABLE, Capacitacion, CapacitacionSchema}