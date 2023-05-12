const { Strategy } = require('passport-local');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const UsuarioService = require('./../../../services/usuario.service');
const service = new UsuarioService();

const LocalStrategy = new Strategy({
    usernameField: 'username',
    passwordField: 'contraseña'
  },
  async (username, contraseña, done) => {
    try {
      const user = await service.findByUsername(username);
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