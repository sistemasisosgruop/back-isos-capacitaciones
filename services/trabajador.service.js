const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const {models} = require('./../libs/sequelize')

class TrabajadorService{
    constructor(){}

    async create(data){
        const hash = await bcrypt.hash(data.contraseña, 10)
        const nuevo =  await models.Trabajador.create({
            ...data,
            contraseña: hash
        })
        delete nuevo.dataValues.contraseña;
        return nuevo;
    }

    async find(){
        const trabajador = await models.Trabajador.findAll();
        return trabajador
    }

    async findByDni(dni){
        const trabajador = await models.Trabajador.findOne({
            where: {dni}
        });
        return trabajador
    }

    async findOne(id){
        const trabajador =  await models.Trabajador.findByPk(id);
        if(!trabajador){
            throw boom.notFound('Trabajador no encontrado')
        }
        return trabajador;
    }

    async update(id, changes){
        const trabajador = await this.findOne(id);
        const respuesta = await trabajador.update(changes);
        return respuesta;
    }

    async delete(id){
        const trabajador = await this.findOne(id);
        await trabajador.destroy();
        return {id};
    }

}

module.exports = TrabajadorService;