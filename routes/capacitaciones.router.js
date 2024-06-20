const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: 'firmas/' });
const {models} = require('../libs/sequelize');

const router = Router();

router.get('/', async(req, res, next)=>{
    try {
        const capacitaciones = await models.Capacitacion.findAll({
            include: ['examen', 'Empresas'],
        });
        // const id = 714
        // const admin = await models.CapacitacionEmpresa.findOne( {
        //   where: {userId: id}
        // })
        // console.log(admin.userId)
        res.json(capacitaciones)
    } catch (error) {
        next(error);
    }
})
router.get('/capacitador/:id', async(req, res, next)=>{
    try {
        const {id} = req.params;
        const capacitaciones = await models.Capacitacion.findAll({
            include: ['examen', 'Empresas'],
            where: {'$Empresas->CapacitacionEmpresa.empresa_id$': id}
        });
        res.json(capacitaciones)
    } catch (error) {
        next(error);
    }
})

router.get('/:id', async(req,res,next)=>{
    try {
        const {id} = req.params;
        const capacitacion = await models.Capacitacion.findByPk(id,{
            include: ['examen', 'Empresas']
        });
        let preguntas = null;
        if (capacitacion.examen) {
            preguntas = await models.Pregunta.findAll({
              where: {examenId: capacitacion.examen.id}
            });
        }
        res.json({capacitacion, preguntas})
    } catch (error) {
        res.json({message: "No existe la capacitacion"})
    }
})

router.get('/:id/certificado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const capacitacion = await models.Capacitacion.findByPk(id);
    if (capacitacion.certificado) {
      const filePath = path.join(__dirname, '..', '', capacitacion.certificado);
      res.sendFile(filePath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('certificado'), async (req, res) => {
  try {
    const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo, empresas, examen, horas, userId } = req.body;
    console.log(req.body)
    const certificado = req.file ? req.file.path : null;
    
    
    if (!empresas) {
      res.json({message: "Faltan empresas" })
    }
    const capacitacion = await models.Capacitacion.create({
      nombre,
      instructor,
      fechaInicio,
      fechaCulminacion,
      urlVideo,
      horas,
      certificado,
      userId
    });
    
    const splitempresa = empresas.split(',')
    const empresasArray = Array.isArray(empresas) ? empresas : splitempresa;
    await Promise.all(empresasArray.map(empresaId => capacitacion.addEmpresa(empresaId)));


    const examenfinal = JSON.parse(examen)

    if (examenfinal&& examenfinal.titulo && Array.isArray(examenfinal.preguntas)) {

      if (examenfinal.preguntas.length === 5) {
        
        const examenCreado = await capacitacion.createExamen({ titulo: examenfinal.titulo });
        for (const pregunta of examenfinal.preguntas) {
          const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta } = pregunta;
          const preguntaCreada = await models.Pregunta.create({ texto, examenId: examenCreado.id,texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta });
        } 
      }else{
        res.json({message: "Debes tener 5 preguntas, no menos ni más"})
      }

    }

    res.status(201).json(capacitacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear la capacitación.' });
  }
});

router.post('/:capacitacionId/examen', async (req, res) => {
  const { capacitacionId } = req.params;

  try {
    const capacitacion = await models.Capacitacion.findByPk(capacitacionId);

    if (!capacitacion) {
      return res.status(404).json({ message: 'No se encontró la capacitación' });
    }
    const { titulo, preguntas } = req.body;

    if (!preguntas ||preguntas.length === 0) {
      return res.status(400).json({message: 'Se requiere al menos una pregunta'})
    }else{
      const examenCreado = await capacitacion.createExamen({ titulo });
      
      for (const pregunta of preguntas) {
        const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta } = pregunta;
        const preguntaCreada = await models.Pregunta.create({ texto, examenId: examenCreado.id,texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta });
      }
      res.status(201).json(examenCreado);
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el examen.' });
  }
}); 
  


router.patch('/:id', upload.single('certificado'), async (req, res) => {
    const { id } = req.params;
    try {
      // Obtener la capacitación a actualizar
      const capacitacion = await models.Capacitacion.findByPk(id,{
        include: ['examen', 'Empresas']
      });
  
      if (!capacitacion) {
        return res.status(404).json({ message: 'No se encontró la capacitación' });
      }
  
      // Actualizar los datos de la capacitación
      const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo, fechaAplazo, horas, habilitado } = req.body;
      const certificado = req.file ? req.file.path : capacitacion.certificado;
  
      
      await capacitacion.update({
        nombre: nombre ?? capacitacion.nombre,
        instructor: instructor ?? capacitacion.instructor,
        fechaInicio: fechaInicio ?? capacitacion.fechaInicio,
        fechaCulminacion: fechaCulminacion ?? capacitacion.fechaCulminacion,
        urlVideo: urlVideo ?? capacitacion.urlVideo,
        fechaAplazo: fechaAplazo ?? capacitacion.fechaAplazo,
        horas: horas?? capacitacion.horas,
        certificado: certificado ?? capacitacion.certificado,
        habilitado: habilitado ?? capacitacion.habilitado
      });
      
      const empresasdecap = req.body.empresas

      if (empresasdecap) {
        const empresasActuales = await capacitacion.getEmpresas();
        const nuevasEmpresas = empresasdecap ? Array.isArray(empresasdecap) ? empresasdecap : empresasdecap.split(',') : [];
        const nuevas = nuevasEmpresas.map(empresa => parseInt(empresa))
        const empresasAEliminar = empresasActuales.filter(empresa => !nuevasEmpresas.includes(empresa.id));
        const empresasAAgregar = nuevasEmpresas.filter(empresa => !empresasActuales.map(e => e.id).includes(empresa));
        const elimina =await Promise.all(empresasAEliminar.map(empresa => capacitacion.removeEmpresa(empresa)));  
        const add = await Promise.all(empresasAAgregar.map(empresaId => capacitacion.addEmpresa(empresaId)));  
      }
        
  
      // Crear el examen si no existe
      if (req.body.examen) {
        if (!capacitacion.examen) {
          const parseexamen = JSON.parse(req.body.examen)
          
          if(parseexamen.preguntas.length === 5){    
            const examenCreado = await capacitacion.createExamen({ titulo: parseexamen.titulo });
              
            // Crear las preguntas y asociarlas con el examen
            for (const pregunta of parseexamen.preguntas) {
              const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta } = pregunta;
              const preguntaCreada = await models.Pregunta.create({ texto, examenId: examenCreado.id,texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta });
            }
          }else{
            res.json({message: "Debes tener 5 preguntas, no más ni menos"})
          }
        }else{
          console.log(capacitacion.examen);
          const parseexamen = JSON.parse(req.body.examen)
          capacitacion.examen.titulo = parseexamen.titulo;
          await capacitacion.examen.save();
  
          const preguntaExistente = await capacitacion.examen.getPregunta();
  
          for (const pregunt of preguntaExistente){
            await pregunt.destroy();
          }
            
          for (const pregunta of parseexamen.preguntas){
            const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta } = pregunta;
            const preguntaCreada = await models.Pregunta.create({ texto,examenId: capacitacion.examen.id, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta });
            await capacitacion.examen.addPregunta(preguntaCreada);
          }
        }
      }
      
      res.status(200).json(capacitacion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar la capacitación.' });
    }
  });

router.delete('/:id', async(req,res,next)=>{
  try {
    const { id } = req.params;

    const capacitacion = await models.Capacitacion.findByPk(id);
    if (!capacitacion) {
      return res.status(404).json({ message: 'Capacitación no encontrada.' });
    }

    const examen = await models.Examen.findOne({ where: { capacitacionId: id } });
    if (examen) {
      const preguntas = await models.Pregunta.findAll({ where: {examenId: examen.id}})
      for (pregunta of preguntas){
        await pregunta.destroy()
      }
      await examen.destroy()
    }
    await models.CapacitacionEmpresa.destroy({
      where: {
        capacitacion_id: capacitacion.id
      }
    });
    await capacitacion.destroy();
    res.status(201).json({message: 'eliminados'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la capacitación.' });
  }
})

module.exports = router;
