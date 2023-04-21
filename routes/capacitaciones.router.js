const { Router } = require('express');
const multer = require('multer');

const upload = multer({ dest: 'firmas/' });
const {models} = require('../libs/sequelize');

const router = Router();

router.get('/', async(req, res, next)=>{
    try {
        const capacitaciones = await models.Capacitacion.findAll({
            include: ['examen', 'Empresas']
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
        res.json(capacitacion)
    } catch (error) {
        next(error)
    }
})

router.post('/', upload.single('certificado'), async (req, res) => {
  try {
    const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo, empresas, examen } = req.body;
    const certificado = req.file ? req.file.path : null;
    
    const capacitacion = await models.Capacitacion.create({
      nombre,
      instructor,
      fechaInicio,
      fechaCulminacion,
      urlVideo,
      certificado,
    });

    const empresasArray = Array.isArray(empresas) ? empresas : [empresas];
    await Promise.all(empresasArray.map(empresaId => capacitacion.addEmpresa(empresaId)));
    
    if (examen) {
      const examenCreado = await capacitacion.createExamen({ titulo: examen.titulo });
        
      for (const pregunta of examen.preguntas) {
        const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta } = pregunta;
        const preguntaCreada = await models.Pregunta.create({ texto, examenId: examenCreado.id,texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta, puntajeDePregunta });
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
      const capacitacion = await models.Capacitacion.findByPk(id);
  
      if (!capacitacion) {
        return res.status(404).json({ message: 'No se encontró la capacitación' });
      }
  
      // Actualizar los datos de la capacitación
      const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo, fechaAplazo, horas } = req.body;
      const certificado = req.file ? req.file.path : capacitacion.certificado;
  
      await capacitacion.update({
        nombre: nombre ?? capacitacion.nombre,
        instructor: instructor ?? capacitacion.instructor,
        fechaInicio: fechaInicio ?? capacitacion.fechaInicio,
        fechaCulminacion: fechaCulminacion ?? capacitacion.fechaCulminacion,
        urlVideo: urlVideo ?? capacitacion.urlVideo,
        fechaAplazo: fechaAplazo ?? capacitacion.fechaAplazo,
        horas: horas?? capacitacion.horas,
        certificado,
      });
      
      if (req.body.empresas) {
        const empresasActuales = await capacitacion.getEmpresas();
        const nuevasEmpresas = req.body.empresas ? Array.isArray(req.body.empresas) ? req.body.empresas : [req.body.empresas] : [];
        const empresasAEliminar = empresasActuales.filter(empresa => !nuevasEmpresas.includes(empresa.id));
        const empresasAAgregar = nuevasEmpresas.filter(empresa => !empresasActuales.map(e => e.id).includes(empresa));
        const elimina =await Promise.all(empresasAEliminar.map(empresa => capacitacion.removeEmpresa(empresa)));  
        const add = await Promise.all(empresasAAgregar.map(empresaId => capacitacion.addEmpresa(empresaId)));  
      }
      
  
      // Crear el examen si no existe
      if (!capacitacion.examen && req.body.examen) {
        const examenCreado = await capacitacion.createExamen({ titulo: req.body.examen.titulo });
          
        // Crear las preguntas y asociarlas con el examen
        for (const pregunta of req.body.examen.preguntas) {
          const { texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta } = pregunta;
          const preguntaCreada = await models.Pregunta.create({ texto, examenId: examenCreado.id,texto, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta });

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
    res.status(201).json({msg: 'eliminados'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la capacitación.' });
  }
})

module.exports = router;
