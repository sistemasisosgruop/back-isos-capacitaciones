const Joi = require('joi');

const id = Joi.number().integer();
const nombres = Joi.string();
const edad = Joi.number();
const contacto = Joi.string();

const userId = Joi.number().integer()
const username = Joi.string()
const contraseña = Joi.string().min(8);
const role = Joi.string().valid('Administrador');

const createAdministradorSchema = Joi.object({
    nombres : nombres.required(),
    edad : edad.required(),
    contacto: contacto.required(),
    user: Joi.object({
      username: username.required(),
      contraseña : contraseña.required(),
      rol: role.required(),
    })
});

const updateAdministradorSchema = Joi.object({
    nombres : nombres,
    edad : edad,
    contacto: contacto,
    userId
});

const getAdministradorSchema = Joi.object({
  id: id
});

module.exports = { createAdministradorSchema, updateAdministradorSchema, getAdministradorSchema}
