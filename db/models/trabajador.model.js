const { Model, DataTypes, Sequelize } = require('sequelize');

const {USUARIO_TABLE} = require('./user.model');

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
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    userId:{
        field: 'user_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: true,
        references: {
        model: USUARIO_TABLE,
        key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}

class Trabajador extends Model{
    static associate(models){
        //wait
        this.belongsTo(models.Usuario,{
            as: 'user'
        })
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