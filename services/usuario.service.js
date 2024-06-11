const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const {models} = require('./../libs/sequelize')

class UsuarioService{
    constructor(){}

    async create(data){
        const hash = await bcrypt.hash(data.contraseña, 10)
        const nuevo =  await models.Usuario.create({
            ...data,
            contraseña: hash
        })
        delete nuevo.dataValues.contraseña;
        return nuevo;
    }

    async find(){
        const usuario = await models.Usuario.findAll({
            include: ['trabajador', 'administrador', 'capacitador'] 
        });
        return usuario
    }

    async findByUsername(username){
        const usuario = await models.Usuario.findOne({
            where: {username}
        });
        return usuario
    }

    async findOne(id){
        const usuario =  await models.Usuario.findByPk(id);
        if(!usuario){
            throw boom.notFound('Trabajador no encontrado')
        }
        return usuario;
    }

    async update(id, changes){
        const usuario = await this.findOne(id);
        const respuesta = await usuario.update(changes);
        return respuesta;
    }

    async delete(id){
        const usuario = await this.findOne(id);
        await usuario.destroy();
        return {id};
    }

}

module.exports = UsuarioService;