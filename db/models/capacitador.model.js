const { Model, DataTypes, Sequelize } = require('sequelize');


const {USUARIO_TABLE} = require('./usuario.model');

const CAPACITADOR_TABLE = 'capacitadores';

const CapacitadorSchema = {
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
    edad:{
        allowNull: false,
        type: DataTypes.INTEGER
    },
    contacto:{
        allowNull: false,
        type: DataTypes.INTEGER
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

class Capacitador extends Model{
    static associate(models){
        //wait
        this.belongsTo(models.Usuario,{
            as: 'user'
        })
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: CAPACITADOR_TABLE,
            modelName: 'Capacitador',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {CAPACITADOR_TABLE, Capacitador, CapacitadorSchema}