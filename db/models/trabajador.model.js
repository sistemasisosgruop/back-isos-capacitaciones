const { Model, DataTypes, Sequelize } = require('sequelize');

const TRABAJADOR_TABLE = 'trabajadores';

const TrabajadorSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    nombres:{
        allowNull: false,
        type: DataTypes.STRING
    },
    apellidoPaterno:{
        allowNull: false, 
        type: DataTypes.STRING
    },
    apellidoMaterno:{
        allowNull: false,
        type: DataTypes.STRING
    },
    dni:{
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
    },
    contraseña:{
        allowNull: false,
        type: DataTypes.STRING
    },
    genero:{
        allowNull: false,
        type: DataTypes.STRING 
    },
    edad:{
        allowNull: false,
        type: DataTypes.INTEGER
    },
    fechadenac:{
        allowNull: false,
        type: DataTypes.DATEONLY,
        defaultValue: null
    },
    areadetrabajo:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    cargo:{
        allowNull: false,
        type: DataTypes.STRING
    },
    rol:{
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'Trabajador'
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    }
}

class Trabajador extends Model{
    static associate(){
        //wait
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: TRABAJADOR_TABLE,
            modelName: 'Trabajador',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {TRABAJADOR_TABLE, TrabajadorSchema, Trabajador}