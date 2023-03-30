const Joi = require('joi');

const id = Joi.number().integer();
const nombres = Joi.string();
const apellidoPaterno = Joi.string();
const apellidoMaterno = Joi.string();
const dni = Joi.string().min(8).max(8);
const contraseña = Joi.string().min(8);
const genero = Joi.string();
const edad = Joi.number();
const rol = Joi.string();

const createTrabajadorSchema = Joi.object({
  //id: id.required(),

 nombres : nombres.required(),
 apellidoPaterno : apellidoPaterno.required(),
 apellidoMaterno : apellidoMaterno.required(),
 dni : dni.required(),
 contraseña : contraseña.required(),
 genero : genero.required(),
 edad : edad.required(),
 rol: rol
});

const updateTrabajadorSchema = Joi.object({
    nombres : nombres,
    apellidoPaterno : apellidoPaterno,
    apellidoMaterno : apellidoMaterno,
    dni : dni,
    contraseña : contraseña,
    genero : genero,
    edad : edad,
    rol: rol
});

const getTrabajadorSchema = Joi.object({
  id: id.required(),
});

module.exports = { createTrabajadorSchema, updateTrabajadorSchema, getTrabajadorSchema }