const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const moment = require('moment')

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
        const comprobarUsuario = await models.Usuario.findOne({
            where: {username: nuevoData.user.username}
        })
        if (!comprobarUsuario) {
            
            const nuevotrabajador = await models.Trabajador.create(nuevoData,{
                include:['user']
            });   
                
            delete nuevotrabajador.dataValues.user.dataValues.password;
            return nuevotrabajador;
        } else {
            return false;
        }

    }

    async createExcel(datos, empreId ){
        
        datos = datos.map(objeto=>{
            const nombres = objeto.NOMBRES?objeto.NOMBRES:'corregir nombre';
            const apellidoPaterno = objeto['APELLIDO PATERNO']?objeto['APELLIDO PATERNO']:'corregir apellido';
            const apellidoMaterno = objeto['APELLIDO  MATERNO']?objeto['APELLIDO  MATERNO']:'corregir apellido';
            const dni = objeto.DNI?objeto.DNI:undefined;
            const genero = objeto['SEXO (F/M)']?objeto['SEXO (F/M)']:'corregir sexo';
            const edad = objeto.EDAD;
            const areadetrabajo = objeto['Tipo de trabajo']?objeto['Tipo de trabajo']:'corregir tipo de trabajo';
            const cargo = objeto.CARGO?objeto.CARGO:'corregir cargo';
            const fechadenaci = objeto['FECHA DE NACIMIENTO']?objeto['FECHA DE NACIMIENTO']:'01/01/2000';
            const fechadenac = moment(fechadenaci, 'DD/MM/YYYY').format('YYYY-MM-DD');
            const username = dni;
            const contraseña = objeto.CONTRASEÑA?objeto.CONTRASEÑA:username;
            const newUser = {username, contraseña}
            const empresaId = empreId;
            return { nombres, apellidoPaterno, apellidoMaterno, dni, genero, edad, areadetrabajo, cargo, fechadenac, user: newUser, empresaId };
        })
        

        const nuevosTrabajadores = [];
        for(const i of datos){
            const trabajadorExistente = await this.findByDni(i.dni.toString());
            const usuarioExistente = await models.Usuario.findOne({
                where: {username: i.user.username.toString()}
            })
            if(!trabajadorExistente && !usuarioExistente){
                nuevosTrabajadores.push(i);
            }
        }
        if (nuevosTrabajadores.length > 0) {
            for (const usuario of nuevosTrabajadores) {
                usuario.user.contraseña = await bcrypt.hash(usuario.user.contraseña.toString(), 10);
            }
            const trabajador = await models.Trabajador.bulkCreate(nuevosTrabajadores,{
                include:['user']
            });
            return trabajador;
        }else{
            return false;
        }
    }

    async find(){
        const trabajador = await models.Trabajador.findAll({
            include:['user','empresa', 'reporte'],
            distinct: true
        });
        return trabajador
    }

    async findByDni(dni){
        const trabajador = await models.Trabajador.findOne({
            where: {dni},
            include: ['user', 'empresa']
        });
        return trabajador
    }

    async findOne(id){
        const trabajador =  await models.Trabajador.findByPk(id,{
            include: ['user', 'empresa']
        });
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