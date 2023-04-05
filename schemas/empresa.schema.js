const Joi = require('joi');
const boom = require('@hapi/boom');

const id = Joi.number().integer();
const nombreEmpresa = Joi.string();
const direccion = Joi.string();
const nombreGerente = Joi.string();
const numeroContacto = Joi.number();
const imagenLogo = Joi.string();
const imagenCertificado = Joi.string();
const RUC = Joi.number().max(12);

const createEmpresaSchema = Joi.object({
  nombreEmpresa: nombreEmpresa.required(),
  direccion: direccion.required(),
  nombreGerente: nombreGerente.required(),
  numeroContacto: numeroContacto.required(),
  RUC: RUC.required()
});

function createEmpresaSchemas(req, res, next) {
  const schema = Joi.object({
    nombreEmpresa: Joi.string().required(),
    direccion: Joi.string().required(),
    nombreGerente: Joi.string().required(),
    numeroContacto: Joi.number().required(),
    RUC: Joi.number().required()
  });
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    next(boom.badRequest(error));
  }
  next();
}
function createEmpresaFilesSchemas(req, res, next) {
  const schema = Joi.object({
    imagenLogo: Joi.any().required(),
    imagenCertificado: Joi.any().required()
  });
  const { error } = schema.validate(req.files, { abortEarly: false });
  if (error) {
    next(boom.badRequest(error));
  }
  next();
}


const createEmpresaFilesSchema = Joi.object({
  imagenLogo: imagenLogo.required(),
  imagenCertificado: imagenCertificado.required(),
})

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

module.exports = { createEmpresaSchema,createEmpresaFilesSchema, updateEmpresaSchema, getEmpresaSchema, createEmpresaSchemas, createEmpresaFilesSchemas }