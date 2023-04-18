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
        const associations = await models.Capacitacion.associations;
            console.log(associations);

        res.json(capacitaciones)
    } catch (error) {
        next(error);
    }
})

router.get('/:id', async(req,res,next)=>{
    try {
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

    // Obtener la ruta del archivo subido por el usuario
    const certificado = req.file ? req.file.path : null;
    
    // Crear la capacitación
    const capacitacion = await models.Capacitacion.create({
      nombre,
      instructor,
      fechaInicio,
      fechaCulminacion,
      urlVideo,
      certificado,
    });

    // Asociar las empresas con la capacitación
    const empresasArray = Array.isArray(empresas) ? empresas : [empresas];
    await Promise.all(empresasArray.map(empresaId => capacitacion.addEmpresa(empresaId)));
    
    // Crear el examen y asociarlo con la capacitación si existe
    if (examen) {
      const examenCreado = await capacitacion.createExamen({ titulo: examen.titulo });
        
      // Crear las preguntas y asociarlas con el examen
      for (const pregunta of examen.preguntas) {
        await examenCreado.createPregunta(pregunta);
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
      // Obtener la capacitación existente a la que se asociará el examen
      const capacitacion = await models.Capacitacion.findByPk(capacitacionId);
  
      if (!capacitacion) {
        return res.status(404).json({ message: 'No se encontró la capacitación' });
      }
      
      console.log('id de la capacitacion'+ capacitacionId);
      // Crear el examen
      const { titulo, preguntas } = req.body;
  
      console.log('titulo '+ titulo);
      console.log('preguntas '+ preguntas);
      
      const examenCreado = await capacitacion.createExamen({ titulo });
  
      console.log('examen creado', examenCreado);
      // Crear las preguntas y asociarlas con el examen
      await Promise.all(preguntas.map(async (pregunta) => {
        const { text, opcion1, opcion2, opcion3, opcion4, opcion5, respuesta_correcta } = pregunta;
        const preguntaCreada = await examenCreado.createPregunta({ text });
        await preguntaCreada.createOpcion({ descripcion: opcion1, esCorrecta: respuesta_correcta === 'opcion1' });
        await preguntaCreada.createOpcion({ descripcion: opcion2, esCorrecta: respuesta_correcta === 'opcion2' });
        await preguntaCreada.createOpcion({ descripcion: opcion3, esCorrecta: respuesta_correcta === 'opcion3' });
        await preguntaCreada.createOpcion({ descripcion: opcion4, esCorrecta: respuesta_correcta === 'opcion4' });
        await preguntaCreada.createOpcion({ descripcion: opcion5, esCorrecta: respuesta_correcta === 'opcion5' });
      }));
  
      res.status(201).json(examenCreado);
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
      const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo } = req.body;
      const certificado = req.file ? req.file.path : capacitacion.certificado;
  
      await capacitacion.update({
        nombre: nombre ?? capacitacion.nombre,
        instructor: instructor ?? capacitacion.instructor,
        fechaInicio: fechaInicio ?? capacitacion.fechaInicio,
        fechaCulminacion: fechaCulminacion ?? capacitacion.fechaCulminacion,
        urlVideo: urlVideo ?? capacitacion.urlVideo,
        certificado,
      });
  
      // Obtener las empresas asociadas a la capacitación
      const empresasActuales = await capacitacion.getEmpresas();
  
      // Obtener las empresas nuevas
      const nuevasEmpresas = req.body.empresas ? Array.isArray(req.body.empresas) ? req.body.empresas : [req.body.empresas] : [];
  
      // Obtener las empresas a eliminar
      const empresasAEliminar = empresasActuales.filter(empresa => !nuevasEmpresas.includes(empresa.id));
  
      // Obtener las empresas a agregar
      const empresasAAgregar = nuevasEmpresas.filter(empresa => !empresasActuales.map(e => e.id).includes(empresa));
  
      // Eliminar las empresas que ya no están asociadas a la capacitación
      await Promise.all(empresasAEliminar.map(empresa => capacitacion.removeEmpresa(empresa)));
  
      // Agregar las empresas nuevas a la capacitación
      await Promise.all(empresasAAgregar.map(empresaId => capacitacion.addEmpresa(empresaId)));
  
      // Crear el examen si no existe
      if (!capacitacion.examen && req.body.examen) {
        const examenCreado = await capacitacion.createExamen({ titulo: req.body.examen.titulo });
          
        // Crear las preguntas y asociarlas con el examen
        for (const pregunta of req.body.examen.preguntas) {
          await examenCreado.createPregunta(pregunta);
        }
      }
  
      res.status(200).json(capacitacion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar la capacitación.' });
    }
  });


module.exports = router;
