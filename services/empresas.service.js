const boom = require('@hapi/boom');

const {models} = require('./../libs/sequelize')

class EmpresaService{
    constructor(){}

    async create(data){
        
        const newEmpresa = await models.Empresa.create(data);
        return newEmpresa;
    }

    async find(){
        const trabajador = await models.Empresa.findAll();
        return trabajador
    }

    async findOne(id){
        const trabajador =  await models.Empresa.findByPk(id);
        if(!trabajador){
            throw boom.notFound('Empresa no encontrado')
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

module.exports = EmpresaService;