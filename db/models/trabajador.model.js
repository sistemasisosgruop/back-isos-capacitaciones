const { Model, DataTypes, Sequelize, UUIDV4 } = require('sequelize');

const TRABAJADOR_TABLE = 'trabajadores';

const TrabajadorSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: UUIDV4
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
            timestamps: false
        }
    }
}

module.exports = {TRABAJADOR_TABLE, TrabajadorSchema, Trabajador}