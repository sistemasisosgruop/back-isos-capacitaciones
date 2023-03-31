const { Model, DataTypes, Sequelize } = require('sequelize');


const {USUARIO_TABLE} = require('./usuario.model');

const ADMINISTRADOR_TABLE = 'administradores';

const AdministradorSchema = {
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

class Administrador extends Model{
    static associate(models){
        //wait
        this.belongsTo(models.Usuario,{
            as: 'user'
        })
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: ADMINISTRADOR_TABLE,
            modelName: 'Administrador',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {ADMINISTRADOR_TABLE, Administrador, AdministradorSchema}