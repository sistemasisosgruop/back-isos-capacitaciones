const { Model, DataTypes, Sequelize } = require('sequelize');

const {USUARIO_TABLE} = require('./usuario.model');
const { EMPRESA_TABLE } = require('./empresa.model');
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
    celular:{
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
    habilitado:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    },
    empresaId:{
        field: 'empresa_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references:{
            model: EMPRESA_TABLE,
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
        });
        this.belongsTo(models.Empresa,{
            as: 'empresa'
        });
        this.hasOne(models.Reporte,{
            as: 'reporte',
            foreignKey: 'trabajadorId'
        });
        this.hasMany(models.Emo,{
            as: "emo",
            foreignKey: 'trabajadorId',
            sourceKey: 'dni'
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