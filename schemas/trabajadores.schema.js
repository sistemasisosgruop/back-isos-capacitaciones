const Joi = require('joi');
const moment = require('moment')

const id = Joi.number().integer();
const nombres = Joi.string();
const apellidoPaterno = Joi.string();
const apellidoMaterno = Joi.string();
const dni = Joi.string().min(8).max(8);
const genero = Joi.string();
const edad = Joi.number();
const areadetrabajo = Joi.string();
const cargo = Joi.string();
const fechadenac = Joi.string().custom((value, helpers)=>{
const date = moment(value, 'YYYY/MM/DD', true);
  if(!date.isValid()){
    return helpers.message({
      custom: 'La fecha de nacimiento debe estar en el formato YYYY/MM/DD o tiene una mal fecha 32/02/1990'
    })
  }else if (date.isAfter(moment())) {
    return helpers.message({
      custom: 'La fecha de nacimiento no puede ser una fecha en el futuro' }); // Devuelve un mensaje de error si la fecha es mayor a la fecha actual
  }
  return value;
});

const habilitado = Joi.boolean()
const userId = Joi.number().integer()
const username = Joi.string()
const contraseña = Joi.string().min(8);
const rol = Joi.string();
const empresaId = Joi.number().integer();

const createTrabajadorSchema = Joi.object({
    nombres : nombres.required(),
    apellidoPaterno : apellidoPaterno.required(),
    apellidoMaterno : apellidoMaterno.required(),
    dni : dni.required(),
    genero : genero.required(),
    edad : edad.required(),
    areadetrabajo: areadetrabajo.required(),
    cargo: cargo.required(),
    fechadenac: fechadenac.required(),
    user: Joi.object({
      username: username.required(),
      contraseña : contraseña.required(),
      rol: rol,
    }),
    empresaId: empresaId.required(),
});

const updateTrabajadorSchema = Joi.object({
    nombres : nombres,
    apellidoPaterno : apellidoPaterno,
    apellidoMaterno : apellidoMaterno,
    dni : dni,
    genero : genero,
    edad : edad,
    areadetrabajo: areadetrabajo,
    cargo: cargo,
    fechadenac: fechadenac,
    habilitado: habilitado,
    user: Joi.object({
      username: username,
      contraseña: contraseña,
      rol: rol
    }),
    empresaId: empresaId,
});

const getTrabajadorSchema = Joi.object({
  id: id
});

module.exports = { createTrabajadorSchema, updateTrabajadorSchema, getTrabajadorSchema }