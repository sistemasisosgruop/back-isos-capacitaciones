const { Router } = require("express");

const router = Router();
const { models } = require("./../libs/sequelize");
const generarReporte = require("./../services/reporte.service");
const passport = require("passport");
const moment = require("moment");

const { checkWorkRol } = require("./../middlewares/auth.handler");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  try {
    let { page, limit, nombreEmpresa, capacitacion, mes, all } = req.query;
    
    page = page ? parseInt(page) : 1;
    limit = all === 'true' ? null : (limit ? parseInt(limit) : 15);
    const offset = all === 'true' ? null : (page - 1) * limit;
    
    const startOfMonth = moment()
      .set({ year: moment().year() - 1, month: mes - 1, date: 1 })
      .startOf("day")
      .format("YYYY-MM-DD");
    const endOfMonth = moment()
      .set({ year: moment().year() - 1, month: mes - 1 })
      .endOf("month")
      .endOf("day")
      .format("YYYY-MM-DD");

    const mesCondition =
      mes !== undefined && mes !== ""
        ? {
            created_at: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          }
        : {};
    const empresaCondition =
      nombreEmpresa !== undefined && nombreEmpresa !== ""
        ? { nombreEmpresa: { [Op.like]: `%${nombreEmpresa}%` } }
        : {};
    const capacitacionCondition =
      capacitacion !== undefined && capacitacion !== ""
        ? { nombre: { [Op.like]: `%${capacitacion}%` } }
        : {};
    // Set default values for page and limit


    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }
    const totalReports = await models.Reporte.count({
      include:[
        {
          model: models.Trabajador,
          where: { habilitado: true },
          attributes: [
            "id",
            "nombres",
            "apellidoMaterno",
            "apellidoPaterno",
            "dni",
            "cargo",
            "edad",
            "genero",
            "empresaId",
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresa",
              where: empresaCondition,
              attributes: [
                "id",
                "nombreEmpresa",
                "imagenLogo",
                "imagenCertificado",
              ],
            },
          ],
        },
      ]
    });

    const reporte = await models.Reporte.findAndCountAll({
      include: [
        {
          model: models.Trabajador,
          where: { habilitado: true },
          attributes: [
            "id",
            "nombres",
            "apellidoMaterno",
            "apellidoPaterno",
            "dni",
            "cargo",
            "edad",
            "genero",
            "empresaId",
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresa",
              where: empresaCondition,
              attributes: [
                "id",
                "nombreEmpresa",
                "imagenLogo",
                "imagenCertificado",
              ],
            },
          ],
        },
        {
          model: models.Capacitacion,
          as: "capacitacion",
          where: capacitacionCondition,
        },
        {
          model: models.Examen,
          as: "examen",
          where: mesCondition,
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
      limit,
      offset,
    });
    const format = reporte?.rows?.map((item) => {
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
        fechaExamen: moment(item?.examen?.fechadeExamen).format("DD-MM-YYYY"),
        notaExamen: item?.notaExamen,
        examen: item.examen,
        asistenciaExamen: item?.asistenciaExamen,
        mesExamen: moment(item?.examen?.fechadeExamen)?.month() + 1,
        examenId: item?.examen?.id,
        examenId: item?.examen,
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
          urlVideo: item?.capacitacion?.urlVideo,
        },
        createdAt: moment(item?.capacitacion?.createdAt),
        nombreCapacitacion: item?.capacitacion?.nombre,
        capacitacionId: item?.capacitacion?.id,
        pregunta: item?.examen?.pregunta.sort((a, b) => {
          // Extraer el número del texto de cada pregunta
          const numA = a.texto ? parseInt(a.texto.split(".")[0]) : 0;
          const numB = b.texto ? parseInt(b.texto.split(".")[0]) : 0;

          // Devolver la diferencia entre los números para ordenar
          return numA - numB;
        }),
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

    const pageInfo = {
      total: totalReports,
      page: page,
      limit: limit,
      totalPage: Math.ceil(totalReports / limit),
      next: parseInt(page)+ 1,
      
    };

    // Enviar la respuesta con la paginación
    res.json({ data: format, pageInfo });
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
