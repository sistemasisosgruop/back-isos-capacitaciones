const { Router } = require("express");

const { models } = require("../libs/sequelize");
const generarReporte = require("../services/reporte.service");

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
    // await generarReporte();
    const id = req.params.id;
    console.log(id);
    const trabajador = await models.Trabajador.findOne({
      where: { dni: id },
      include: [
        {
          model: models.Empresa,
          as: "empresa",
          include: [
            {
              model: models.Capacitacion,
              where: { habilitado: true },
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

    if (trabajador?.empresa) {
      trabajador?.empresa?.Capacitacions?.map((capacitacion) => {
        // Buscar el reporte correspondiente para esta capacitacion
        const reporte = reportes?.find(
          (reporte) => reporte.capacitacionId === capacitacion.id
        );
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
          notaExamen: reporte?.notaExamen,
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
        });
      });
    }
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
