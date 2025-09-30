const { Model, DataTypes, Sequelize } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresa.model');

const EMPRESA_RELACIONES_TABLE = 'empresa_relaciones';

const EmpresaRelacionesSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    empresaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: EMPRESA_TABLE,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
    },
    relacionadaConEmpresaId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: EMPRESA_TABLE,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    }
};

class EmpresaRelaciones extends Model {
    static associate(models) {
        this.belongsTo(models.Empresa, {
            as: 'empresa',
            foreignKey: 'empresaId'
        });
        this.belongsTo(models.Empresa, {
            as: 'empresaRelacionada',
            foreignKey: 'relacionadaConEmpresaId'
        });
    }
    static config(sequelize) {
        return {
            sequelize,
            tableName: EMPRESA_RELACIONES_TABLE,
            modelName: 'EmpresaRelaciones',
            timestamps: false,
            updatedAt: false,
            deletedAt: false,
        };
    }
}

module.exports = {
    EMPRESA_RELACIONES_TABLE,
    EmpresaRelaciones,
    EmpresaRelacionesSchema
};