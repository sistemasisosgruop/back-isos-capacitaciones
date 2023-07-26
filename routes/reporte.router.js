const { Router } = require("express");

const router = Router();
const { models } = require("./../libs/sequelize");
const generarReporte = require("./../services/reporte.service");
const passport = require("passport");
const moment = require("moment");

const { checkWorkRol } = require("./../middlewares/auth.handler");

router.get("/", async (req, res) => {
  try {
    // await generarReporte();

    // const reportes = await models.Empresa.findAll({
    //   where: { id: 39 },

    //   include: [
    //     {
    //       model: models.Capacitacion,
    //       include: [
    //         {
    //           model: models.Reporte,
    //           as: "reporte",
    //           include: [{ model: models.Trabajador, as: "trabajador" }],
    //         },
    //         {
    //           model: models.Examen,
    //           as: "examen",
    //           include: [{ model: models.Pregunta, as: "pregunta" }],
    //         },
    //       ],
    //     },
    //   ],
    // });

    const prueba = await models.Reporte.findAll({
      include: [
        {
          model: models.Trabajador,
          attributes: [
            "id",
            "nombres",
            "apellidoMaterno",
            "apellidoPaterno",
            "dni",
            "cargo",
            "edad",
            "genero",
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresa",
              attributes: [
                "id",
                "nombreEmpresa",
                "imagenLogo",
                "imagenCertificado",
              ],
            },
          ],
        },
        { model: models.Capacitacion, as: "capacitacion" },
        {
          model: models.Examen,
          as: "examen",
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
    });

    const format = prueba.map((item) => {
      return {
        trabajadorId: item?.trabajador?.id,
        nombreTrabajador:
          item?.trabajador?.apellidoPaterno +
          " " +
          item?.trabajador?.apellidoMaterno +
          " " +
          item?.trabajador?.nombres,
        nombreCapacitacion: item?.capacitacion?.nombreCapacitacion,
        nombreEmpresa: item?.trabajador?.empresa?.nombreEmpresa,
        empresaId: item?.trabajador?.empresa?.id,
        fechaExamen: moment(item?.createdAt).format("DD-MM-YYYY"),
        notaExamen: item?.notaExamen,
        asistenciaExamen: item?.asistenciaExamen,
        mesExamen: moment(item?.examen?.fechadeExamen)?.month() + 1,
        examenId: item?.examen?.id,
        capacitacion: {
          certificado: item?.capacitacion?.certificado,
          createdAt: item?.capacitacion?.createdAt,
          fechaAplazo: item?.capacitacion?.fechaAplazo,
          fechaCulminacion: item?.capacitacion?.fechaCulminacion,
          fechaInicio: item?.capacitacion?.fechaInicio,
          horas: item?.capacitacion?.horas,
          habilitado: item?.capacitacion?.habilitado,
          id: item?.capacitacion?.id,
          instructor: item?.capacitacion?.instructor,
          nombre: item?.capacitacion?.nombre,
          urlVideo: item?.capacitacion?.urlVideo
        },
        createdAt: moment(item?.capacitacion?.createdAt),
        nombreCapacitacion: item?.capacitacion?.nombre,
        capacitacionId: item?.capacitacion?.id,
        pregunta: item?.examen?.pregunta,
        trabajador: {
          id: item?.trabajador?.id,
          apellidoMaterno: item?.trabajador?.apellidoMaterno,
          apellidoPaterno: item?.trabajador?.apellidoPaterno,
          nombres: item?.trabajador?.nombres,
          cargo: item?.trabajador?.cargo,
          edad: item?.trabajador?.edad,
          genero: item?.trabajador?.genero,
          dni: item?.trabajador?.dni,
        },
        empresa: item?.trabajador?.empresa,
        reporte: {
          id: item?.id,
          notaExamen: item?.notaExamen,
          asistenciaExamen: item?.asistenciaExamen,
          rptpregunta1: item?.rptpregunta1,
          rptpregunta2: item?.rptpregunta2,
          rptpregunta3: item?.rptpregunta3,
          rptpregunta4: item?.rptpregunta4,
          rptpregunta5: item?.rptpregunta5,
        },
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
        return res.json({ message: "No existe el trabajador" });
      }
      if (!examen) {
        return res.json({ message: "No existe el examen" });
      }
      if (!capacitacion) {
        return res.json({ message: "No existe la capacitacion" });
      }
      if (trabajador && trabajador.habilitado === false) {
        return res.json({
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
      console.log(reporte);
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
      console.log(err);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

module.exports = router;
