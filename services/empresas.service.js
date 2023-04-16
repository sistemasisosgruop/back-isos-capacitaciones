const boom = require('@hapi/boom');

const {models} = require('./../libs/sequelize')

class EmpresaService{
    constructor(){}

    async create(data){
        
        const newEmpresa = await models.Empresa.create({
            nombreEmpresa: data.nombreEmpresa,
            direccion: data.direccion,
            nombreGerente: data.nombreGerente,
            numeroContacto: data.numeroContacto,
            imagenLogo: data.imagenLogo ? data.imagenLogo[0].filename : null,
            imagenCertificado: data.imagenCertificado ? data.imagenCertificado[0].filename : null,
            RUC: data.RUC
        });
        return newEmpresa;
    }

    async find(){
        const empresa = await models.Empresa.findAll();
        return empresa
    }

    async findOne(id){
        const empresa =  await models.Empresa.findByPk(id,{
            include: ['trabajadores']
        });
        if(!empresa){
            throw boom.notFound('Empresa no encontrado');
        }
        return empresa;
    }

    async update(id, changes){
        const empresa = await this.findOne(id);
        console.log(id);
        console.log(changes.imagenCertificado[0].filename);
        //const respuesta = await empresa.update(changes);
        
        return empresa;
    }

    async delete(id){
        const empresa = await this.findOne(id);
        await empresa.destroy();
        return {id};
    }

}

module.exports = EmpresaService;