const Joi = require('joi');

const id = Joi.number().integer();
const nombreEmpresa = Joi.string();
const direccion = Joi.string();
const nombreGerente = Joi.string();
const numeroContacto = Joi.number();
const imagenLogo = Joi.string();
const imagenCertificado = Joi.string();
const RUC = Joi.number();

const createEmpresaSchema = Joi.object({
  nombreEmpresa: nombreEmpresa.required(),
  direccion: direccion.required(),
  nombreGerente: nombreGerente.required(),
  numeroContacto: numeroContacto.required(),
  imagenLogo: imagenLogo.required(),
  imagenCertificado: imagenCertificado.required(),
  RUC: RUC.required()
});

const updateEmpresaSchema = Joi.object({
  nombreEmpresa: nombreEmpresa,
  direccion: direccion,
  nombreGerente: nombreGerente,
  numeroContacto: numeroContacto,
  imagenLogo: imagenLogo,
  imagenCertificado: imagenCertificado,
  RUC: RUC
});

const getEmpresaSchema = Joi.object({
  id: id.required(),
});

module.exports = { createEmpresaSchema, updateEmpresaSchema, getEmpresaSchema }