const { Administrador, AdministradorSchema } = require('./administrador.model');
const { Empresa, EmpresaSchema } = require('./empresa.model');
const { Test, TestSchema } = require('./test.model');
const { Trabajador, TrabajadorSchema } = require('./trabajador.model');
const { Usuario, UsuarioSchema } = require('./usuario.model');

function setupModels(sequelize) {
    Usuario.init(UsuarioSchema, Usuario.config(sequelize))
    Trabajador.init(TrabajadorSchema, Trabajador.config(sequelize));
    Administrador.init(AdministradorSchema, Administrador.config(sequelize));
    Empresa.init(EmpresaSchema, Empresa.config(sequelize));
    Test.init(TestSchema, Test.config(sequelize));

    Usuario.associate(sequelize.models);
    Trabajador.associate(sequelize.models);
    Administrador.associate(sequelize.models);
    Empresa.associate(sequelize.models);
    Test.associate(sequelize.models)
}

module.exports = setupModels;