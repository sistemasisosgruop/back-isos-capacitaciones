const { Administrador, AdministradorSchema } = require("./administrador.model");
const { Capacitacion, CapacitacionSchema } = require("./capacitacion.model");
const {
  CapacitacionEmpresa,
  CapacitacionEmpresaSchema,
} = require("./capacitacionEmpresa.model");
const { Empresa, EmpresaSchema } = require("./empresa.model");
const { EmpresaRelaciones, EmpresaRelacionesSchema } = require("./empresaRelaciones.model");
const { Test, TestSchema } = require("./test.model");
const { Trabajador, TrabajadorSchema } = require("./trabajador.model");
const { Capacitador, CapacitadorSchema } = require("./capacitador.model");
const { Usuario, UsuarioSchema } = require("./usuario.model");
const { Examen, ExamenSchema } = require("./examen.model");
const { Pregunta, PreguntaSchema } = require("./pregunta.model");
const { TestEmpresa, TestEmpresaSchema } = require("./testEmpresa.model");
const { Reporte, ReportesSchema } = require("./reportes.model");
const { Emo, EmoSchema } = require("./emo.model");
const {
  RegistroDescarga,
  RegistroDescargaSchema,
} = require("./registroDescarga.model");

function setupModels(sequelize) {
  Usuario.init(UsuarioSchema, Usuario.config(sequelize));
  Trabajador.init(TrabajadorSchema, Trabajador.config(sequelize));
  Capacitador.init(CapacitadorSchema, Capacitador.config(sequelize));
  Administrador.init(AdministradorSchema, Administrador.config(sequelize));
  Empresa.init(EmpresaSchema, Empresa.config(sequelize));
  EmpresaRelaciones.init(EmpresaRelacionesSchema, EmpresaRelaciones.config(sequelize));
  Test.init(TestSchema, Test.config(sequelize));
  Capacitacion.init(CapacitacionSchema, Capacitacion.config(sequelize));
  CapacitacionEmpresa.init(
    CapacitacionEmpresaSchema,
    CapacitacionEmpresa.config(sequelize)
  );
  Examen.init(ExamenSchema, Examen.config(sequelize));
  Pregunta.init(PreguntaSchema, Pregunta.config(sequelize));
  TestEmpresa.init(TestEmpresaSchema, TestEmpresa.config(sequelize));
  Reporte.init(ReportesSchema, Reporte.config(sequelize));
  Emo.init(EmoSchema, Emo.config(sequelize));
  RegistroDescarga.init(
    RegistroDescargaSchema,
    RegistroDescarga.config(sequelize)
  );

  Usuario.associate(sequelize.models);
  Trabajador.associate(sequelize.models);
  Capacitador.associate(sequelize.models);
  Administrador.associate(sequelize.models);
  Empresa.associate(sequelize.models);
  EmpresaRelaciones.associate(sequelize.models);
  Test.associate(sequelize.models);
  Capacitacion.associate(sequelize.models);
  Examen.associate(sequelize.models);
  Pregunta.associate(sequelize.models);
  Reporte.associate(sequelize.models);
  Emo.associate(sequelize.models);
  RegistroDescarga.associate(sequelize.models)
}

module.exports = setupModels;
