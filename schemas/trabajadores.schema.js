const Joi = require('joi');
const moment = require('moment')

const id = Joi.number().integer();
const nombres = Joi.string();
const apellidoPaterno = Joi.string();
const apellidoMaterno = Joi.string();
const dni = Joi.string().min(8).max(8);
const contraseña = Joi.string().min(8);
const genero = Joi.string();
const edad = Joi.number();
const areadetrabajo = Joi.string();
const cargo = Joi.string();
const rol = Joi.string();
const fechadenac = Joi.string().custom((value, helpers)=>{
  const date = moment(value, 'DD/MM/YYYY', true);
  if(!date.isValid()){
    return helpers.message({
      custom: 'La fecha de nacimiento debe estar en el formato DD/MM/YYYY o tiene una mal fecha 32/02/1990'
    })
  }else if (date.isAfter(moment())) {
    return helpers.message({
      custom: 'La fecha de nacimiento no puede ser una fecha en el futuro' }); // Devuelve un mensaje de error si la fecha es mayor a la fecha actual
  }
  return value;
});

const createTrabajadorSchema = Joi.object({
    nombres : nombres.required(),
    apellidoPaterno : apellidoPaterno.required(),
    apellidoMaterno : apellidoMaterno.required(),
    dni : dni.required(),
    contraseña : contraseña.required(),
    genero : genero.required(),
    edad : edad.required(),
    areadetrabajo: areadetrabajo.required(),
    cargo: cargo.required(),
    fechadenac: fechadenac.required(),
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
    areadetrabajo: areadetrabajo,
    cargo: cargo,
    fechadenac: fechadenac,
    rol: rol
});

const getTrabajadorSchema = Joi.object({
  id: id.required(),
});

module.exports = { createTrabajadorSchema, updateTrabajadorSchema, getTrabajadorSchema }