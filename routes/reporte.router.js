const {Router} = require('express');

const router = Router();
const {models} = require('./../libs/sequelize');

router.get('/', async(req,res)=>{
    try {
        const reportes = await models.Reporte.findAll({
            include: ['examen', 'capacitacion', 'trabajador']
            
        });
        res.json(reportes)
    } catch (error) {
        console.log(error);
        res.json({msg:'ya valio madre'})
    }
})

router.post('/darexamen/:capacitacionId/:trabajadorId/:examenId', async (req,res, next)=>{
    const { capacitacionId, trabajadorId, examenId } = req.params;
    const respuestas = req.body.respuestas;

    try{
    const capacitacion = await models.Capacitacion.findByPk(capacitacionId);
    const trabajador = await models.Trabajador.findByPk(trabajadorId);
    const examen = await models.Examen.findByPk(examenId, {
        include: ['pregunta']
    })
    
    let notaExamen = 0;
    for (let i = 0; i < respuestas.length; i++) {
        const respuesta = respuestas[i];
        const pregunta = examen.pregunta[i];
        if (respuesta === pregunta.respuesta_correcta) {
            notaExamen += pregunta.puntajeDePregunta;  
        }
    }

    const reporte = await models.Reporte.create({
        notaExamen,
        asistenciaExamen: true,
        rptpregunta1: respuestas[0]?respuestas[0]:0,
        rptpregunta2: respuestas[1]?respuestas[1]:0,
        rptpregunta3: respuestas[2]?respuestas[2]:0,
        rptpregunta4: respuestas[3]?respuestas[3]:0,
        rptpregunta5: respuestas[4]?respuestas[4]:0,
        trabajadorId: trabajadorId,
        examenId: examenId,
        capacitacionId: capacitacionId
    })
    res.json(reporte)
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'No se pudo crear el reporte', });
    }
})





module.exports = router