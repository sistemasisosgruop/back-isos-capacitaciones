const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const {models} = require('./../libs/sequelize')

class TrabajadorService{
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
        const nuevotrabajador = await models.Trabajador.create(nuevoData,{
            include:['user']
        });

        delete nuevotrabajador.dataValues.user.dataValues.password;
        return nuevotrabajador;
    }

    async createExcel(datos, empreId ){
        datos = datos.map(objeto => {
            const { nombres, apellidoPaterno, apellidoMaterno, dni, genero, edad, areadetrabajo, cargo, fechadenac, contraseña } = objeto;
            const empresaId = empreId;
            const username = dni;
            const newUser = { username, contraseña };
            return { nombres, apellidoPaterno, apellidoMaterno, dni, genero, edad, areadetrabajo, cargo, fechadenac, user: newUser, empresaId };
        });

        const trabajador = await models.Trabajador.bulkCreate(datos);
        return trabajador;
    }

    async find(){
        const trabajador = await models.Trabajador.findAll({
            include:['user']
        });
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