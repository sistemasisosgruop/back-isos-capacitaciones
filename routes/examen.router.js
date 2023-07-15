const { Router } = require("express");

const { models } = require("../libs/sequelize");

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

// router.get("/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const examenes = await models.Examen.findByPk(id, {
//       include: ["capacitacion", "pregunta"],
//     });
//     if (!examenes) {
//       res.status(404).json({ message: "No existe el examen" });
//     }
//     res.json(examenes);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const examenes = await models.Trabajador.findOne({
      where: { dni: id },
      include: [
        {
          model: models.Empresa,
          as: "empresa",
          include: [
            {
              model: models.Capacitacion,
              include: [
                {
                  model: models.Reporte,
                  as: "reporte",
                  include: [
                    {
                      model: models.Examen,
                      as: "examen",
                      include: [{ model: models.Pregunta, as: "pregunta" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    let newData = [];

    examenes.empresa.Capacitacions.map((capacitacion) => {
      newData.push({
        maximaNotaExamen: capacitacion?.reporte?.notaExamen,
        asistenciaExamen: capacitacion?.reporte?.asistenciaExamen,
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
          urlVideo: capacitacion?.urlVideo,
        },
        capacitacionId: capacitacion?.CapacitacionEmpresa?.capacitacionId,
        createdAt: examenes?.createdAt,
        examen: capacitacion?.reporte?.examen,
        examenId: capacitacion?.reporte?.examenId,
        fechaCapacitacion: capacitacion?.fechaInicio,
        fechaExamen: capacitacion?.reporte?.examen?.fechadeExamen,
        id: capacitacion?.reporte?.id,
        mesExamen: parseInt(
          capacitacion?.reporte?.examen?.fechadeExamen?.split("-")[1]
        ),
        nombreCapacitacion: capacitacion?.nombre,
        nombreEmpresa: examenes?.empresa?.nombreEmpresa,
        nombreTrabajador:
          examenes?.nombres +
          " " +
          examenes?.apellidoPaterno +
          " " +
          examenes?.apellidoMaterno,
        notaExamen: capacitacion?.reporte?.notaExamen,
        rptpregunta1: capacitacion?.reporte?.rptpregunta1,
        rptpregunta2: capacitacion?.reporte?.rptpregunta2,
        rptpregunta3: capacitacion?.reporte?.rptpregunta3,
        rptpregunta4: capacitacion?.reporte?.rptpregunta4,
        rptpregunta5: capacitacion?.reporte?.rptpregunta5,
        trabajador: {
          id: examenes?.userId,
          nombres: examenes?.nombres,
          apellidoPaterno: examenes?.apellidoPaterno,
          apellidoMaterno: examenes?.apellidoMaterno,
          dni: examenes?.dni,
          edad: examenes?.edad,
          empresa: examenes?.empresa,
          empresaId: examenes?.empresa?.id,
          fechadenac: examenes?.fechadenac,
          genero: examenes?.genero,
          habilitado: examenes?.habilitado,
        },
        trabajadorId: examenes?.userId,
      });
    });

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
