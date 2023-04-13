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
    }

}