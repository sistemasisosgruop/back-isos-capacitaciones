const { Model, DataTypes, Sequelize } = require('sequelize');

const { CAPACITACION_TABLE } = require('./capacitacion.model');
const { EXAMEN_TABLE } = require('./examen.model')
const { TRABAJADOR_TABLE } = require('./trabajador.model')

const REPORTES_TABLE = 'reportes';

const ReportesSchema = {
    id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    notaExamen:{
        type: DataTypes.INTEGER,
        
    },
    asistenciaCapacitación:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    asistenciaExamen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    rptpregunta1:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rptpregunta2:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rptpregunta3:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rptpregunta4:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rptpregunta5:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    trabajadorId: {
      field: 'trabajador_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true,
      references: {
        model: TRABAJADOR_TABLE,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    examenId: {
      field: 'examen_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true,
      references: {
        model: EXAMEN_TABLE,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    capacitacionId: {
      field: 'capacitacion_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true,
      references: {
        model: CAPACITACION_TABLE,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
    
}

class Reporte extends Model{
    static associate(models){
        this.belongsTo(models.Trabajador, {as: 'trabajador'});
        this.belongsTo(models.Examen, {as: 'examen'});
        this.belongsTo(models.Capacitacion, {as: 'capacitacion'});
    }

    static config(sequelize){
        return{
            sequelize,
            tableName: REPORTES_TABLE,
            modelName: 'Reporte',
            timestamps: false,
        }
    }
}

module.exports = {REPORTES_TABLE, Reporte, ReportesSchema}