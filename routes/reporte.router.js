const {Router} = require('express');

const router = Router();
const {models} = require('./../libs/sequelize');
const generarReporte = require('./../services/reporte.service')

router.get('/', async(req,res)=>{
    try {
        await generarReporte()

        const reportes = await models.Reporte.findAll({
            include: ['examen', 'capacitacion', 'trabajador']
            
        });
        const associate = await models.Reporte.associations
        console.log(associate);
        res.json(reportes)
    } catch (error) {
        console.log(error);
        res.json({message:'no encuentra reportes'})
    }
})

router.patch('/darexamen/:capacitacionId/:trabajadorId/:examenId', async (req,res, next)=>{
    const { capacitacionId, trabajadorId, examenId } = req.params;
    const respuestas = req.body.respuestas;

    console.log('TIPO', typeof(respuestas))
    console.log(respuestas);
    try{
    const capacitacion = await models.Capacitacion.findByPk(capacitacionId);
    const trabajador = await models.Trabajador.findByPk(trabajadorId);
    const examen = await models.Examen.findByPk(examenId, {
        include: ['pregunta']
    })

    const respuestasPorPregunta = {};
        respuestas.forEach(respuesta => {
        respuestasPorPregunta[respuesta.preguntaId] = respuesta.respuesta;
    });

    let notaExamen = 0;


    examen.pregunta.forEach(pregunta => {
        const respuesta = respuestasPorPregunta[pregunta.id];
        console.log('pregunta-respuesta',typeof(respuesta))
        if (respuesta === pregunta.respuesta_correcta) {
            notaExamen += pregunta.puntajeDePregunta;
        }
    });
    console.log('NOTA EXAMEN:', notaExamen);
    const reporte = await models.Reporte.findOne({
        where:{trabajadorId : trabajador.id,
                capacitacionId: capacitacion.id,
                examenId: examen.id
            }
    })
    console.log('ID reporte', reporte.id)
    const busquedaReporte = await models.Reporte.findByPk(reporte.id);

    const reporteact = await reporte.update({
        notaExamen: notaExamen,
        asistenciaExamen: true,
        rptpregunta1: respuestasPorPregunta[examen.pregunta[0].id]?respuestasPorPregunta[examen.pregunta[0].id]:0,
        rptpregunta2: respuestasPorPregunta[examen.pregunta[1].id]?respuestasPorPregunta[examen.pregunta[1].id]:0,
        rptpregunta3: respuestasPorPregunta[examen.pregunta[2].id]?respuestasPorPregunta[examen.pregunta[2].id]:0,
        rptpregunta4: respuestasPorPregunta[examen.pregunta[3].id]?respuestasPorPregunta[examen.pregunta[3].id]:0,
        rptpregunta5: respuestasPorPregunta[examen.pregunta[4].id]?respuestasPorPregunta[examen.pregunta[4].id]:0,
        trabajadorId: trabajadorId,
        examenId: examenId,
        capacitacionId: capacitacionId
    })
    console.log(reporteact);
    res.json(reporte)
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'No se pudo conectar el reporte', });
    }
})





module.exports = router