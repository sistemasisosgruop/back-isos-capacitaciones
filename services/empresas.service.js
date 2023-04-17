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
        const empresa = await models.Empresa.findByPk(id);
        if(!empresa){
            throw new Error('Empresa no encontrada');
        }
        const updateEmpresa = await empresa.update({
            nombreEmpresa: changes.nombreEmpresa,
            direccion: changes.direccion,
            nombreGerente: changes.nombreGerente,
            numeroContacto: changes.numeroContacto,
            imagenLogo: changes.imagenLogo ? changes.imagenLogo[0].filename : empresa.imagenLogo,
            imagenCertificado: changes.imagenCertificado ? changes.imagenCertificado[0].filename : empresa.imagenCertificado,
            RUC: changes.RUC
        })
        
        return updateEmpresa;
    }

    async delete(id){
        const empresa = await models.Empresa.findByPk(id,{
            include: ['trabajadores']
        });
        //console.log(empresa);
        if(!empresa.dataValues.trabajadores.length>0){
            await empresa.destroy();
            console.log('Borrado');
            return {id}
        }else{
            throw new Error('Existen trabajadores en la empresa')
        }
    }

}

module.exports = EmpresaService;