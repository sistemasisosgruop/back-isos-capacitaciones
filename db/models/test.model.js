const { Model, DataTypes, Sequelize } = require('sequelize');

const { EMPRESA_TABLE } = require('./empresa.model');

const TEST_TABLE = 'tests';

const TestSchema = {
    id: {
        allownull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    detalle:{
        allownull: false,
        type: DataTypes.STRING
    },
    fechaCr:{
        allownull: false,
        type: DataTypes.DATEONLY
    },
    fechaVen:{
        allownull: false,
        type: DataTypes.DATEONLY
    },
    urlTest:{
        allownull: false,
        type: DataTypes.STRING,
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
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
};

class Test extends Model{
    static associate(models) {
        this.belongsToMany(models.Empresa, {
            through: models.TestEmpresa,
            foreignKey: 'testId',
        });
      }
    
    static config(sequelize){
        return {
            sequelize,
            tableName: TEST_TABLE,
            modelName: 'Test',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {TEST_TABLE, Test, TestSchema}