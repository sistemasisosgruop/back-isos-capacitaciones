const { Router } = require("express");

const router = Router();
const { models } = require("./../libs/sequelize");
const generarReporte = require("./../services/reporte.service");
const passport = require("passport");

const { checkWorkRol } = require("./../middlewares/auth.handler");

router.get("/", async (req, res) => {
  try {
    // await generarReporte();

    const reportes = await models.Reporte.findAll({
      include: [
        { model: models.Examen, as: "examen" },
        { model: models.Capacitacion, as: "capacitacion" },
        {
          model: models.Trabajador,
          as: "trabajador",
          include: [{ model: models.Empresa, as: "empresa" }],
        },
      ],
    });

    const format = reportes.map((item) => {
      const trabajador = item.trabajador;
      const capacitacion = item.capacitacion;
      const empresa = item.trabajador.empresa;
      const examen = item.examen

      return {

        nombreTrabajador:
          trabajador.apellidoMaterno + " " +
          trabajador.apellidoPaterno + " " +
          trabajador.nombres,
        nombreCapacitacion: capacitacion.nombre,
        nombreEmpresa: empresa.nombreEmpresa,
        fechaExamen: examen.fechadeExamen,
        notaExamen: item.notaExamen,
        asistenciaExamen: item.asistenciaExamen,
        ...item.toJSON()
      };
    });
    res.json(format);
  } catch (error) {
    console.log(error);
    res.json({ message: "no encuentra reportes" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await generarReporte();
    const { id } = req.params;
    const reporte = await models.Reporte.findByPk(id, {
      include: ["examen", "capacitacion", "trabajador"],
    });
    if (!reporte) {
      res.status(404).json({ message: "No existe reporte" });
    } else {
      const empresaid = reporte.trabajador.empresaId;
      const empresa = await models.Empresa.findByPk(empresaid);
      res.json({ reporte, empresa });
    }
  } catch (error) {
    res.json({ message: "No existe ese reporte" });
  }
});

router.patch(
  "/darexamen/:capacitacionId/:trabajadorId/:examenId",
  passport.authenticate("jwt", { session: false }),
  checkWorkRol,
  async (req, res, next) => {
    const { capacitacionId, trabajadorId, examenId } = req.params;

    const respuestas = req.body.respuestas;

    try {
      const capacitacion = await models.Capacitacion.findByPk(capacitacionId);
      const trabajador = await models.Trabajador.findByPk(trabajadorId);
      const examen = await models.Examen.findByPk(examenId, {
        include: ["pregunta"],
      });
      if (!trabajador) {
        res.json({ message: "No existe el trabajador" });
      }
      if (!examen) {
        res.json({ message: "No existe el examen" });
      }
      if (!capacitacion) {
        res.json({ message: "No existe la capacitacion" });
      }
      if (trabajador && trabajador.habilitado === false) {
        res.json({
          message: "No puede dar el examen porque está deshabilitado",
        });
      }

      const respuestasPorPregunta = {};
      respuestas.forEach((respuesta) => {
        respuestasPorPregunta[respuesta.preguntaId] = respuesta.respuesta;
      });

      let notaExamen = 0;

      examen.pregunta.forEach((pregunta) => {
        const respuesta = respuestasPorPregunta[pregunta.id];
        if (respuesta === pregunta.respuesta_correcta) {
          notaExamen += pregunta.puntajeDePregunta;
        }
      });
      const reporte = await models.Reporte.findOne({
        where: {
          trabajadorId: trabajador.id,
          capacitacionId: capacitacion.id,
          examenId: examen.id,
        },
      });

      const reporteact = await reporte.update({
        notaExamen: notaExamen,
        asistenciaExamen: true,
        rptpregunta1: examen.pregunta[0]
          ? respuestasPorPregunta[examen.pregunta[0].id]
            ? respuestasPorPregunta[examen.pregunta[0].id]
            : 0
          : 0,
        rptpregunta2: examen.pregunta[1]
          ? respuestasPorPregunta[examen.pregunta[1].id]
            ? respuestasPorPregunta[examen.pregunta[1].id]
            : 0
          : 0,
        rptpregunta3: examen.pregunta[2]
          ? respuestasPorPregunta[examen.pregunta[2].id]
            ? respuestasPorPregunta[examen.pregunta[2].id]
            : 0
          : 0,
        rptpregunta4: examen.pregunta[3]
          ? respuestasPorPregunta[examen.pregunta[3].id]
            ? respuestasPorPregunta[examen.pregunta[3].id]
            : 0
          : 0,
        rptpregunta5: examen.pregunta[4]
          ? respuestasPorPregunta[examen.pregunta[4].id]
            ? respuestasPorPregunta[examen.pregunta[4].id]
            : 0
          : 0,
        trabajadorId: trabajadorId,
        examenId: examenId,
        capacitacionId: capacitacionId,
      });
      res.json(reporte);
    } catch (err) {
      res.status(500).json({ message: "Error interno" });
    }
  }
);

module.exports = router;
