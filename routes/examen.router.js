const { Router } = require("express");
const moment = require("moment");

const { models } = require("../libs/sequelize");
const generarReporte = require("../services/reporte.service");
const { Op } = require("sequelize");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const examenes = await models.Examen.findAll({
      include: ["capacitacion", "pregunta"],
    });
    res.json(examenes);
  } catch (error) {
    next(error);
  }
});

router.get("/preguntas", async (req, res, next) => {
  try {
    const preguntas = await models.Pregunta.findAll();
    res.json(preguntas);
  } catch (error) {
    next(error);
  }
});

router.patch("/preguntas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const pregunta = await models.Pregunta.findByPk(id);
    if (!pregunta) {
      res.status(404).json({ message: "Pregunta no encontrada" });
    } else {
      const respuesta = await pregunta.update(body);
      res.status(200).json(respuesta);
    }
  } catch (error) {
    res.status(500).json({ message: "Pregunta no fue actualizada" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const examenes = await models.Examen.findByPk(id, {
      include: ["capacitacion", "pregunta"],
    });
    if (!examenes) {
      res.status(404).json({ message: "No existe el examen" });
    }
    res.json(examenes);
  } catch (error) {
    next(error);
  }
});

router.get("/data/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar trabajador con sus relaciones
    const trabajador = await models.Trabajador.findOne({
      where: { dni: id },
      include: [{
        model: models.Empresa,
        as: "empresas",
        include: [{
          model: models.Capacitacion,
          where: {
            [Op.or]: [{ habilitado: true }, { recuperacion: true }]
          },
          include: ["examen"]
        }]
      }]
    });

    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    // Buscar reportes del trabajador
    const reportes = await models.Reporte.findAll({
      where: { trabajador_id: trabajador.id },
      include: [{
        model: models.Examen,
        as: "examen",
        include: [{ model: models.Pregunta, as: "pregunta" }]
      }]
    });

    // Mapear los datos
    const newData = trabajador?.empresas?.flatMap(empresa => 
      empresa.Capacitacions.map(capacitacion => {
        const reporte = reportes?.find(r => r.capacitacionId === capacitacion.id);
        
        return {
          // Datos del examen
          maximaNotaExamen: reporte?.examen?.pregunta?.reduce(
            (acc, val) => acc + val.puntajeDePregunta, 0
          ) ?? null,
          notaExamen: reporte?.notaExamen,
          asistenciaExamen: reporte?.asistenciaExamen,
          examen: reporte?.examen,
          examenId: reporte?.examenId,
          fechaExamen: reporte?.examen?.fechadeExamen,
          mesExamen: moment(reporte?.examen?.fechadeExamen).month() + 1,
          
          // Datos de respuestas
          rptpregunta1: reporte?.rptpregunta1,
          rptpregunta2: reporte?.rptpregunta2,
          rptpregunta3: reporte?.rptpregunta3,
          rptpregunta4: reporte?.rptpregunta4,
          rptpregunta5: reporte?.rptpregunta5,
          
          // Datos de capacitación
          capacitacion: {
            id: capacitacion?.id,
            nombre: capacitacion?.nombre,
            codigo: capacitacion?.codigo,
            certificado: capacitacion?.certificado,
            createdAt: capacitacion?.createdAt,
            fechaAplazo: capacitacion?.fechaAplazo,
            fechaCulminacion: capacitacion?.fechaCulminacion,
            fechaInicio: capacitacion?.fechaInicio,
            habilitado: capacitacion?.habilitado,
            horas: capacitacion?.horas,
            instructor: capacitacion?.instructor,
            recuperacion: capacitacion?.recuperacion,
            urlVideo: capacitacion?.urlVideo
          },
          capacitacionId: capacitacion?.CapacitacionEmpresa?.capacitacionId,
          fechaCapacitacion: capacitacion?.fechaInicio,
          nombreCapacitacion: capacitacion?.nombre,
          
          
          // Datos de empresa y trabajador
          nombreEmpresa: empresa.nombreEmpresa,
          nombreTrabajador: `${trabajador?.nombres} ${trabajador?.apellidoPaterno} ${trabajador?.apellidoMaterno}`.trim(),
          trabajador: {
            id: trabajador?.id,
            nombres: trabajador?.nombres,
            apellidoPaterno: trabajador?.apellidoPaterno,
            apellidoMaterno: trabajador?.apellidoMaterno,
            dni: trabajador?.dni,
            edad: trabajador?.edad,
            empresa,
            empresaId: empresa.id,
            fechadenac: trabajador?.fechadenac,
            genero: trabajador?.genero,
            habilitado: trabajador?.habilitado
          },
          trabajadorId: trabajador?.id,
          
          // Otros datos
          id: reporte?.id,
          createdAt: trabajador?.createdAt
        };
      })
    ) || [];

    res.json(newData);
  } catch (error) {
    console.error('Error en /data/:id:', error);
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const examen = await models.Examen.findByPk(id);
    if (!examen) {
      res.status(404).json({ message: "No existe el examen" });
    } else {
      const exameneditado = await examen.update(body);
      res.status(200).json(exameneditado);
    }
  } catch (error) {
    res.status(500).json({ message: "Examen no editado" });
  }
});

module.exports = router;
