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

        // Si hay empresas para relacionar, agregar las relaciones
        if (data.relaciones && Array.isArray(data.relaciones)) {
            const relaciones = data.relaciones.map(relacionadaId => ({
                empresaId: newEmpresa.id,
                relacionadaConEmpresaId: relacionadaId,
            }));

            await models.EmpresaRelaciones.bulkCreate(relaciones);
        }
        
        // Recuperar la empresa con sus relaciones
        const empresaConRelaciones = await models.Empresa.findByPk(newEmpresa.id, {
            include: [
                {
                    model: models.Empresa,
                    as: 'relacionadas',
                    attributes: ['id', 'nombreEmpresa']
                }
            ]
        });

        return empresaConRelaciones;
    }

    async find() {
        const empresas = await models.Empresa.findAll({
            include: [
                {
                    model: models.Empresa,
                    as: 'relacionadas',
                    attributes: ['id', 'nombreEmpresa']
                }
            ]
        });
        return empresas;
    }
        

    async findCapacitadorOne(id){
        const empresa = await models.Empresa.findAll({
            where: { id: id }
        });
        return empresa
    }

    async findOne(id) {
        const empresa = await models.Empresa.findByPk(id, {
            include: [
                {
                    model: models.Empresa,
                    as: 'relacionadas',  // Asegúrate de que 'relacionadas' es el alias correcto
                    attributes: ['id', 'nombreEmpresa']  // Puedes agregar más atributos si es necesario
                },
                'trabajadores', // Ya lo tienes, solo asegúrate de que los datos de trabajadores se incluyan también
            ]
        });
    
        if (!empresa) {
            throw boom.notFound('Empresa no encontrada');
        }
    
        return empresa;
    }
    
    

    async update(id, changes) {
        const empresa = await models.Empresa.findByPk(id, {
            include: ['relacionadas']  // Incluir las relaciones actuales de la empresa
        });
    
        if (!empresa) {
            throw boom.notFound('Empresa no encontrada');
        }
    
        // Actualizar la empresa
        const updatedEmpresa = await empresa.update({
            nombreEmpresa: changes.nombreEmpresa,
            direccion: changes.direccion,
            nombreGerente: changes.nombreGerente,
            numeroContacto: changes.numeroContacto,
            imagenLogo: changes.imagenLogo ? changes.imagenLogo[0].filename : empresa.imagenLogo,
            imagenCertificado: changes.imagenCertificado ? changes.imagenCertificado[0].filename : empresa.imagenCertificado,
            RUC: changes.RUC
        });
    
        // Si hay relaciones nuevas, actualizarlas
        if (changes.relaciones && Array.isArray(changes.relaciones)) {
            // Eliminar relaciones anteriores
            await models.EmpresaRelaciones.destroy({
                where: { empresaId: id }
            });
    
            // Agregar las nuevas relaciones
            const relaciones = changes.relaciones.map(relacionadaId => ({
                empresaId: id,
                relacionadaConEmpresaId: relacionadaId,
            }));
    
            await models.EmpresaRelaciones.bulkCreate(relaciones);
        }
    
        // Recuperar la empresa con sus relaciones actualizadas
        const empresaConRelaciones = await models.Empresa.findByPk(id, {
            include: [
                {
                    model: models.Empresa,
                    as: 'relacionadas',
                    attributes: ['id', 'nombreEmpresa']
                }
            ]
        });
    
        return empresaConRelaciones;
    }
    

    async delete(id){
        const empresa = await models.Empresa.findByPk(id,{
            include: ['trabajadores']
        });
        if(!empresa.dataValues.trabajadores.length>0){
            await empresa.destroy();
            return {id}
        }else{
            throw new Error('Existen trabajadores en la empresa')
        }
    }

}

module.exports = EmpresaService;