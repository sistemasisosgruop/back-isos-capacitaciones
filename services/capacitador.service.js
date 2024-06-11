const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const {models} = require('../libs/sequelize')

class CapacitadorService{
    constructor(){}

    async create(data){
        const hash = await bcrypt.hash(data.user.contraseña, 10)
        const nuevoData = {
            ...data,
            user:{
                ...data.user,
                contraseña: hash
            }
        }
        const nuevocapacitador = await models.Capacitador.create(nuevoData,{
            include:['user']
        });

        delete nuevocapacitador.dataValues.user.dataValues.password;
        return nuevocapacitador;
    }

    async find(){
        const capacitador = await models.Capacitador.findAll({
            include:['user']
        });
        return capacitador
    }

    async findOne(id){
        const capacitador =  await models.Capacitador.findByPk(id);
        if(!capacitador){
            throw boom.notFound('Trabajador no encontrado')
        }
        return capacitador;
    }

    async update(id, changes){
        const capacitador = await this.findOne(id);
        const respuesta = await capacitador.update(changes);
        return respuesta;
    }

    async delete(id){
        const capacitador = await this.findOne(id);
        await capacitador.destroy();
        return {id};
    }

}

module.exports = CapacitadorService;