const Joi = require('joi');

const id = Joi.number().integer();
const nombres = Joi.string();
const edad = Joi.number();
const contacto = Joi.string();

const userId = Joi.number().integer()
const username = Joi.string()
const contraseña = Joi.string().min(8);
const role = Joi.string().valid('Capacitador');

const createCapacitadorSchema = Joi.object({
    nombres : nombres.required(),
    edad : edad.required(),
    contacto: contacto.required(),
    user: Joi.object({
      username: username.required(),
      contraseña : contraseña.required(),
      rol: role.required(),
    })
});

const updateCapacitadorSchema = Joi.object({
    nombres : nombres,
    edad : edad,
    contacto: contacto,
    userId
});

const getCapacitadorSchema = Joi.object({
  id: id
});

module.exports = { createCapacitadorSchema, updateCapacitadorSchema, getCapacitadorSchema}
