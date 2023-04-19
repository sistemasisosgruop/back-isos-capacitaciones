const { Model, DataTypes, Sequelize } = require('sequelize');

const {EMPRESA_TABLE} = require('./empresa.model');
const { TEST_TABLE} = require('./test.model');

const TEST_EMPRESA_TABLE = 'tests_empresas';

const TestEmpresaSchema = {
    id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    createdAt:{
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    empresaId: {
        field: 'empresa_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: EMPRESA_TABLE,
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    testId: {
        field: 'test_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: TEST_TABLE,
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
}

class TestEmpresa extends Model{
    static associate(models){
        //
    }
    static config(sequelize){
        return{
            sequelize,
            tableName: TEST_EMPRESA_TABLE,
            modelName: 'TestEmpresa',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        }
    }
}

module.exports = {TEST_EMPRESA_TABLE, TestEmpresa, TestEmpresaSchema}