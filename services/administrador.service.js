const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const {models} = require('./../libs/sequelize')

class AdministradorService{
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
        const nuevoadmin = await models.Administrador.create(nuevoData,{
            include:['user']
        });

        delete nuevoadmin.dataValues.user.dataValues.password;
        return nuevoadmin;
    }

    async find(){
        const admin = await models.Administrador.findAll({
            include:['user']
        });
        return admin
    }

    async findOne(id){
        const admin =  await models.Administrador.findByPk(id);
        if(!admin){
            throw boom.notFound('Trabajador no encontrado')
        }
        return admin;
    }

    async update(id, changes){
        const admin = await this.findOne(id);
        const respuesta = await admin.update(changes);
        return respuesta;
    }

    async delete(id){
        const admin = await this.findOne(id);
        await admin.destroy();
        return {id};
    }

}

module.exports = AdministradorService;