const { Trabajador, TrabajadorSchema } = require('./trabajador.model');
const { Usuario, UsuarioSchema } = require('./user.model');

function setupModels(sequelize) {
    Usuario.init(UsuarioSchema, Usuario.config(sequelize))
    Trabajador.init(TrabajadorSchema, Trabajador.config(sequelize));


    Usuario.associate(sequelize.models);
    Trabajador.associate(sequelize.models);
}

module.exports = setupModels;