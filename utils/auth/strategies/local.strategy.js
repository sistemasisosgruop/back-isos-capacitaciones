const { Strategy } = require('passport-local');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const TrabajadorService = require('./../../../services/trabajador.service');
const service = new TrabajadorService();

const LocalStrategy = new Strategy({
    usernameField: 'dni',
    passwordField: 'contraseña'
  },
  async (dni, contraseña, done) => {
    try {
      const user = await service.findByDni(dni);
      if (!user) {
        done(boom.unauthorized(), false);
      }
      const isMatch = await bcrypt.compare(contraseña, user.contraseña);
      if (!isMatch) {
        done(boom.unauthorized(), false);
      }
      delete user.dataValues.contraseña;
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;