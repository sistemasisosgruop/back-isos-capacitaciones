const { Administrador, AdministradorSchema } = require('./administrador.model');
const { Capacitacion, CapacitacionSchema } = require('./capacitacion.model');
const { CapacitacionEmpresa, CapacitacionEmpresaSchema } = require('./capacitacionEmpresa.model');
const { Empresa, EmpresaSchema } = require('./empresa.model');
const { Test, TestSchema } = require('./test.model');
const { Trabajador, TrabajadorSchema } = require('./trabajador.model');
const { Usuario, UsuarioSchema } = require('./usuario.model');
const { Examen, ExamenSchema} = require('./examen.model');
const { Pregunta, PreguntaSchema} = require('./pregunta.model');
const { TestEmpresa, TestEmpresaSchema } = require('./testEmpresa.model');

function setupModels(sequelize) {
    Usuario.init(UsuarioSchema, Usuario.config(sequelize))
    Trabajador.init(TrabajadorSchema, Trabajador.config(sequelize));
    Administrador.init(AdministradorSchema, Administrador.config(sequelize));
    Empresa.init(EmpresaSchema, Empresa.config(sequelize));
    Test.init(TestSchema, Test.config(sequelize));
    Capacitacion.init(CapacitacionSchema, Capacitacion.config(sequelize));
    CapacitacionEmpresa.init(CapacitacionEmpresaSchema, CapacitacionEmpresa.config(sequelize));
    Examen.init(ExamenSchema, Examen.config(sequelize));
    Pregunta.init(PreguntaSchema, Pregunta.config(sequelize));
    TestEmpresa.init(TestEmpresaSchema, TestEmpresa.config(sequelize))

    Usuario.associate(sequelize.models);
    Trabajador.associate(sequelize.models);
    Administrador.associate(sequelize.models);
    Empresa.associate(sequelize.models);
    Test.associate(sequelize.models);
    Capacitacion.associate(sequelize.models);
    Examen.associate(sequelize.models);
    Pregunta.associate(sequelize.models);
}

module.exports = setupModels;