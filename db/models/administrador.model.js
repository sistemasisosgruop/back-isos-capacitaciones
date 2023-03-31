const { Model, DataTypes, Sequelize } = require('sequelize');

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
    }
}

class Administrador extends Model{
    static associate(){
        //wait
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