const { Trabajador, TrabajadorSchema } = require('./trabajador.model');

function setupModels(sequelize) {
    Trabajador.init(TrabajadorSchema, Trabajador.config(sequelize));

}

module.exports = setupModels;