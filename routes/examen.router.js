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
    const id = req.params.id;
    const fechaActual = moment();

    const trabajador = await models.Trabajador.findOne({
      where: { dni: id },
      include: [
        {
          model: models.Empresa,
          as: "empresas",
          include: [
            {
              model: models.Capacitacion,
              where: {
                [Op.or]: [
                  {
                    // Capacitaciones dentro de fecha
                    [Op.and]: [
                      { habilitado: true },
                      {
                        fechaCulminacion: {
                          [Op.gte]: fechaActual.format('YYYY-MM-DD')
                        }
                      }
                    ]
                  },
                  {
                    // Capacitaciones en recuperación
                    [Op.and]: [
                      { recuperacion: true },
                      { habilitado: true }
                    ]
                  }
                ],
              },
              include: ["examen"],
            },
          ],
        },
      ],
    });

    const reportes = await models.Reporte.findAll({
      where: { trabajador_id: trabajador.id },
      include: [
        {
          model: models.Examen,
          as: "examen",
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
    });

    let newData = [];

    if (trabajador?.empresas) {
      // Iteramos sobre las empresas asociadas al trabajador
      trabajador?.empresas.forEach((empresa) => {
        // Iteramos sobre las capacitaciones asociadas a cada empresa
        empresa?.Capacitacions.forEach((capacitacion) => {
          // Buscamos el reporte relacionado con la capacitación
          const reporte = reportes?.find(
            (reporte) => reporte.capacitacionId === capacitacion.id
          );

          const estaFueraDeFecha = moment(capacitacion.fechaCulminacion).isBefore(fechaActual, 'day');
          const tieneRecuperacionHabilitada = capacitacion.recuperacion;
          const noHaDadoExamen = !reporte?.asistenciaExamen;
          const haJalado = reporte?.notaExamen < 14; // Asumiendo que 14 es la nota aprobatoria

          // Solo incluir la capacitación si:
          // 1. Está dentro de fecha, o
          // 2. Está en recuperación y (no ha dado el examen o ha jalado)
          if (!estaFueraDeFecha || (tieneRecuperacionHabilitada && (noHaDadoExamen || haJalado))) {
            newData.push({
              maximaNotaExamen:
                reporte?.examen?.pregunta?.reduce(
                  (acc, val) => acc + val.puntajeDePregunta,
                  0
                ) ?? null,
              notaExamen: reporte?.notaExamen,
              asistenciaExamen: reporte?.asistenciaExamen,
              capacitacion: {
                certificado: capacitacion?.certificado,
                createdAt: capacitacion?.createdAt,
                fechaAplazo: capacitacion?.fechaAplazo,
                fechaCulminacion: capacitacion?.fechaCulminacion,
                fechaInicio: capacitacion?.fechaInicio,
                habilitado: capacitacion?.habilitado,
                horas: capacitacion?.horas,
                id: capacitacion?.id,
                instructor: capacitacion?.instructor,
                nombre: capacitacion?.nombre,
                recuperacion: capacitacion?.recuperacion,
                urlVideo: capacitacion?.urlVideo,
              },
              capacitacionId: capacitacion?.CapacitacionEmpresa?.capacitacionId,
              createdAt: trabajador?.createdAt,
              examen: reporte?.examen,
              examenId: reporte?.examenId,
              fechaCapacitacion: capacitacion?.fechaInicio,
              fechaExamen: reporte?.examen?.fechadeExamen,
              id: reporte?.id,
              mesExamen: parseInt(reporte?.examen?.fechadeExamen?.split("-")[1]),
              nombreCapacitacion: capacitacion?.nombre,
              nombreEmpresa: trabajador?.empresa?.nombreEmpresa,
              nombreTrabajador:
                trabajador?.nombres +
                " " +
                trabajador?.apellidoPaterno +
                " " +
                trabajador?.apellidoMaterno,
              rptpregunta1: reporte?.rptpregunta1,
              rptpregunta2: reporte?.rptpregunta2,
              rptpregunta3: reporte?.rptpregunta3,
              rptpregunta4: reporte?.rptpregunta4,
              rptpregunta5: reporte?.rptpregunta5,
              trabajador: {
                id: trabajador?.id,
                nombres: trabajador?.nombres,
                apellidoPaterno: trabajador?.apellidoPaterno,
                apellidoMaterno: trabajador?.apellidoMaterno,
                dni: trabajador?.dni,
                edad: trabajador?.edad,
                empresa: trabajador?.empresa,
                empresaId: trabajador?.empresa?.id,
                fechadenac: trabajador?.fechadenac,
                genero: trabajador?.genero,
                habilitado: trabajador?.habilitado,
              },
              trabajadorId: trabajador?.id,
              estaEnRecuperacion: estaFueraDeFecha && tieneRecuperacionHabilitada
            });
          }
        });
      });
    }

    // Enviar la respuesta como JSON
    res.json(newData);

  } catch (error) {
    console.log(error);
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
