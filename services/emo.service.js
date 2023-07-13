const boom = require('@hapi/boom');

const {models} = require('./../libs/sequelize')

class EmoService{
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
        const emo = await models.Emo.findAll();
        return emo
    }

    async findOne(id){
        const emo =  await models.Emo.findByPk(id,{
            include: ['trabajadores']
        });
        if(!emo){
            throw boom.notFound('Emo no encontrado.');
        }
        return emo;
    }

    async update(id, changes){
        const emo = await models.Emo.findByPk(id);
        if(!empresa){
            throw new Error('Emo no encontradao.');
        }
        const updateEmo = await empresa.update({
            nombreEmpresa: changes.nombreEmpresa,
            direccion: changes.direccion,
            nombreGerente: changes.nombreGerente,
            numeroContacto: changes.numeroContacto,
            imagenLogo: changes.imagenLogo ? changes.imagenLogo[0].filename : empresa.imagenLogo,
            imagenCertificado: changes.imagenCertificado ? changes.imagenCertificado[0].filename : empresa.imagenCertificado,
            RUC: changes.RUC
        })
        
        return updateEmo;
    }

    async delete(id){
        const emo = await models.Emo.findByPk(id,{
            include: ['trabajadores']
        });
        // if(!empresa.dataValues.trabajadores.length>0){
        //     await empresa.destroy();
        //     return {id}
        // }else{
        //     throw new Error('Existen trabajadores en la empresa')
        // }
    }

}

module.exports = EmoService;