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


router.get('/codigo/:codigo', async (req, res, next) => {
  try {
    const { codigo } = req.params;

    // Validar el formato del código
    const regex = /^CERT-(\d+)\.(\d+)-(\d{4})$/;
    const match = codigo.match(regex);
    if (!match) {
      return res.status(400).json({ message: 'Código de certificado inválido' });
    }

    const [, trabajadorId, capacitacionId, anio] = match;
    // Buscar el reporte con los identificadores extraídos
    const reporte = await models.Reporte.findOne({
      where: {
        trabajadorId,
        capacitacionId,
      },
      include: [{
        model: models.Capacitacion,
        as: 'capacitacion',
        attributes: ['codigo', 'nombre', 'horas', 'fechaInicio']
      }]
    });

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Calcular si la capacitación tiene menos de un año
    const fechaCapacitacion = new Date(reporte.capacitacion.fechaInicio);
    const anioReporte = fechaCapacitacion.getFullYear().toString();
    if (anio !== anioReporte) {
      return res.status(400).json({ message: 'El año del código no coincide con el año del examen' });
    }

    // Validar si la capacitación tiene menos de un año
    const fechaExamen = new Date(reporte.fechaExamen);
    const fechaActual = new Date();
    const diferenciaMeses = (fechaActual - fechaExamen) / (1000 * 60 * 60 * 24 * 30);
    const estado = diferenciaMeses <= 12 ? 1 : 0;

    // Respuesta JSON
    const respuesta = {
      codigoCertificado: codigo,
      codigoCapacitacion: reporte.capacitacion?.codigo || 'N/A',
      capacitacion: reporte.capacitacion?.nombre || 'Sin registro',
      fecha: reporte.fechaExamen,
      duracion: reporte.capacitacion ? `${reporte.capacitacion.horas} horas` : '0 horas',
      estado: estado
    };

    res.json(respuesta);
  } catch (error) {
    next(error);
  }
});

 
router.get('/empresa', async(req, res, next)=>{
  try {
      const { empresaId } = req.query;
      if (!empresaId) {
        return res.status(400).json({ message: 'Debe proporcionar un empresaId' });
      }

      const capacitaciones = await models.Capacitacion.findAll({
          include: [
            {
              model: models.Empresa,
              as: 'Empresas',
              through: { attributes: [] }, // Esto evita que se incluyan los atributos de la tabla intermedia
              where: { id: empresaId }
            }
          ]
      });

      res.json(capacitaciones)
  } catch (error) {
      next(error);
  }
})

router.get('/trabajador', async(req, res, next)=>{
  try {
      const { dni } = req.query;
      if (!dni) {
        return res.status(400).json({ message: 'Debe proporcionar un DNI' });
      }

      // Primero encontramos al trabajador por su DNI
      const trabajador = await models.Trabajador.findOne({
        where: { dni },
        include: [{
          model: models.Empresa,
          as: 'empresas'
        }]
      });

      if (!trabajador) {
        return res.status(404).json({ message: 'Trabajador no encontrado' });
      }

      // Obtenemos los IDs de todas las empresas donde está el trabajador
      const empresasIds = trabajador.empresas.map(empresa => empresa.id);

      // Buscamos todas las capacitaciones de esas empresas
      const capacitaciones = await models.Capacitacion.findAll({
        include: [
          {
            model: models.Empresa,
            as: 'Empresas',
            through: { attributes: [] },
            where: { 
              id: empresasIds 
            }
          },
          {
            model: models.Reporte,
            as: 'reporte',
            required: true,
            where: {
              trabajadorId: trabajador.id
            }
          }
        ]
      });
      console.log(capacitaciones);
      res.json(capacitaciones);
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
    const certificado = req.file ? req.file.path : null;
    
    if (!empresas) {
      return res.json({message: "Faltan empresas" });
    }

    // Generar el código antes de crear la capacitación
    const fecha = new Date(fechaInicio);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    
    // Obtener el último ID de capacitación
    const ultimaCapacitacion = await models.Capacitacion.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = ultimaCapacitacion ? ultimaCapacitacion.id + 1 : 1;
    const idPadded = String(nextId).padStart(4, '0');
    const codigo = `CAP${año}${mes}-${idPadded}`;

    const capacitacion = await models.Capacitacion.create({
      nombre,
      instructor,
      fechaInicio,
      fechaCulminacion,
      urlVideo,
      horas,
      certificado,
      userId,
      codigo // Incluimos el código al crear la capacitación
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
      const { nombre, instructor, fechaInicio, fechaCulminacion, urlVideo, fechaAplazo, horas, habilitado, recuperacion } = req.body;
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
        habilitado: habilitado ?? capacitacion.habilitado,
        recuperacion: recuperacion ?? capacitacion.recuperacion
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


  // Ruta para actualizar el estado de recuperación de una capacitación
router.patch('/:id/recuperacion', async (req, res) => {
  const { id } = req.params;
  const { recuperacion } = req.body;

  try {
    // Verificar si se proporcionó el estado de recuperación
    if (recuperacion === undefined) {
      return res.status(400).json({ message: 'El estado de recuperación es necesario.' });
    }

    // Buscar la capacitación por su ID
    const capacitacion = await models.Capacitacion.findByPk(id);
    if (!capacitacion) {
      return res.status(404).json({ message: 'Capacitación no encontrada.' });
    }

    // Actualizar el estado de recuperación
    capacitacion.recuperacion = recuperacion;
    await capacitacion.save();

    res.status(200).json({ message: 'Estado de recuperación actualizado correctamente.', capacitacion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el estado de recuperación.' });
  }
});


router.delete('/:id', async(req,res,next)=>{
  try {
    const { id } = req.params;

    const capacitacion = await models.Capacitacion.findByPk(id);
    if (!capacitacion) {
      return res.status(404).json({ 
        message: 'No se encontró la capacitación solicitada.' 
      });
    }

    // Verificar si existen reportes asociados
    const reportesAsociados = await models.Reporte.findOne({
      where: { capacitacionId: id }
    });

    if (reportesAsociados) {
      return res.status(400).json({ 
        message: 'No se puede eliminar esta capacitación porque tiene reportes asociados.',
        tipo: 'REPORTES_EXISTENTES'
      });
    }

    // Eliminar examen y preguntas asociadas
    const examen = await models.Examen.findOne({ where: { capacitacionId: id } });
    if (examen) {
      try {
        const preguntas = await models.Pregunta.findAll({ where: {examenId: examen.id}})
        for (pregunta of preguntas){
          await pregunta.destroy()
        }
        await examen.destroy()
      } catch (error) {
        return res.status(400).json({ 
          message: 'Hubo un problema al eliminar el examen y sus preguntas. Por favor, inténtelo nuevamente.',
          tipo: 'ERROR_EXAMEN'
        });
      }
    }

    // Eliminar relaciones con empresas
    try {
      await models.CapacitacionEmpresa.destroy({
        where: {
          capacitacion_id: capacitacion.id
        }
      });
    } catch (error) {
      return res.status(400).json({ 
        message: 'No se pudieron eliminar las asociaciones con las empresas. Por favor, inténtelo nuevamente.',
        tipo: 'ERROR_EMPRESAS'
      });
    }

    // Eliminar la capacitación
    try {
      await capacitacion.destroy();
      res.status(200).json({ 
        message: 'La capacitación ha sido eliminada exitosamente junto con todos sus datos relacionados.',
        tipo: 'ELIMINACION_EXITOSA'
      });
    } catch (error) {
      return res.status(400).json({ 
        message: 'No se pudo eliminar la capacitación. Es posible que tenga datos relacionados que impiden su eliminación.',
        tipo: 'ERROR_ELIMINACION'
      });
    }

  } catch (err) {
    res.status(500).json({ 
      message: 'Ocurrió un error inesperado. Por favor, inténtelo más tarde o contacte al administrador del sistema.',
      tipo: 'ERROR_INESPERADO'
    });
  }
})

module.exports = router;
