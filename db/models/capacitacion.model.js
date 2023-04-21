const { Model, DataTypes, Sequelize } = require('sequelize');

const CAPACITACION_TABLE = 'capacitaciones';

const CapacitacionSchema = {
    id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    nombre:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    instructor:{
        allowNull: false,
        type: DataTypes.STRING,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaCulminacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    urlVideo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    horas:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fechaAplazo: {
       type: DataTypes.STRING,
       allowNull: true,
       defaultValue: null
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    }
}

class Capacitacion extends Model{
    static associate(models){
        this.belongsToMany(models.Empresa, {
            through: models.CapacitacionEmpresa,
            foreignKey: 'capacitacionId',
          });
        this.hasOne(models.Examen,{
            as: 'examen',
            foreignKey: 'capacitacionId'
        });
        this.hasOne(models.Reporte,{
            as: 'reporte',
            foreignKey: 'capacitacionId'
        });

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