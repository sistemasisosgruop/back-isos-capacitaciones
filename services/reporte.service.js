const {models} = require('./../libs/sequelize')

const generarReporte = async() => {
    const capacitaciones = await models.Capacitacion.findAll({
        include: ['examen', 'Empresas']
    });

    let i = 0
    // Iterar sobre cada capacitación
    for (const capacitacion of capacitaciones) {
        // Obtener todas las empresas asociadas a la capacitación
        const empresas = capacitacion.Empresas;
        // Iterar sobre cada empresa y buscar los trabajadores asociados
        for (const empresa of empresas) {
        const trabajadores = await models.Trabajador.findAll({
            where: { empresaId: empresa.id }
        });
        // Para cada trabajador, verificar si ya tiene un reporte para la capacitación actual
        for (const trabajador of trabajadores) {
            const reporteExistente = await models.Reporte.findOne({
            where: {
                trabajadorId: trabajador.id,
                capacitacionId: capacitacion.id
            }
            });
            //console.log('REPORTE EXISTENTE', reporteExistente);
            if (!reporteExistente) {
                i= i+1;
              //  console.log('Reportes nuevos');
              const examen = capacitacion.examen ? capacitacion.examen.id : 0;
                    
            // Si no existe un reporte previo, crear uno nuevo con los datos por defecto
            const reporte = await models.Reporte.create({
                notaExamen: 0,
                asistenciaExamen: false,
                rptpregunta1: 0,
                rptpregunta2: 0,
                rptpregunta3: 0,
                rptpregunta4: 0,
                rptpregunta5: 0,
                trabajadorId: trabajador.id,
                examenId: examen,
                capacitacionId: capacitacion.id
            })
            }
        }
        }
    }
    console.log(i);
}
  
module.exports = generarReporte;
  