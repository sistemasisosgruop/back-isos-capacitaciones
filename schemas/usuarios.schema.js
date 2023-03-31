const Joi = require('joi');

const id = Joi.number().integer();
const username = Joi.string();
const contraseña = Joi.string().min(8);
const rol = Joi.string();

const createUsuarioSchema = Joi.object({
  username: username.required(),
  contraseña: contraseña.required(),
  rol: rol
});

const updateUsuarioSchema = Joi.object({
  username: username,
  contraseña: contraseña,
  rol: rol,
});

const getUsuarioSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUsuarioSchema, updateUsuarioSchema, getUsuarioSchema }