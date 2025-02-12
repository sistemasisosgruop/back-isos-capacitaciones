const { Op } = require("sequelize");
const { models } = require("./../libs/sequelize");

const generarReporte = async (id, trabajador) => {
  try {
    //lista de capacitaciones que tiene la empresa en base al trabajador
    const capacitaciones = trabajador.empresa.Capacitacions.map(
      (item) => item.id
    );
    //verifico si las capacitaciones del trabajdor tiene registro de reporte
    const existingReportIds = await models.Reporte.findAll({
      attributes: ["id", "capacitacion_id"],
      where: {
        trabajador_id: trabajador.id,
        capacitacion_id: capacitaciones,
      },
    });
    const formatData = trabajador.empresa.Capacitacions.map((item) => {
      if (
        !existingReportIds.some((report) => (report.dataValues.capacitacion_id === item.id))
      ) {
        return {
          notaExamen: 0,
          asistenciaExamen: false,
          rptpregunta1: 0,
          rptpregunta2: 0,
          rptpregunta3: 0,
          rptpregunta4: 0,
          rptpregunta5: 0,
          trabajadorId: trabajador.id,
          examenId: item.examen.dataValues.id,
          capacitacionId: item.id,
        };
      }
    }).filter((item) => item !== undefined);
    if (formatData.length > 0) {
  
      await models.Reporte.bulkCreate(formatData);
    }

  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

const botonGenerarReporte = async (globalProgress) => {
  const capacitaciones = await models.Capacitacion.findAll({
    where: {
      [Op.or]: [{ habilitado: true }, { recuperacion: true }]
     },
    include: ["examen", "Empresas"],
  });

  const totalCapacitaciones = capacitaciones.length;
  globalProgress = { total: totalCapacitaciones, completado: 0 };

  for (const capacitacion of capacitaciones) {
    if (capacitacion.Empresas.length && capacitacion.examen) {
      // Obtener todos los trabajadores relacionados con las empresas de esta capacitación
      const trabajadores = await models.Trabajador.findAll({
        include: [{
          model: models.Empresa,
          as: 'empresas',
          where: {
            id: capacitacion.Empresas.map(empresa => empresa.id)
          }
        }]
      });

      // Crear reportes faltantes para los trabajadores encontrados
      const reportesACrear = [];
      for (const trabajador of trabajadores) {
        const reporteExistente = await models.Reporte.findOne({
          where: {
            trabajadorId: trabajador.id,
            capacitacionId: capacitacion.id,
          },
        });

        if (!reporteExistente) {
          reportesACrear.push({
            notaExamen: 0,
            asistenciaExamen: false,
            rptpregunta1: 0,
            rptpregunta2: 0,
            rptpregunta3: 0,
            rptpregunta4: 0,
            rptpregunta5: 0,
            trabajadorId: trabajador.id,
            examenId: capacitacion.examen.id,
            capacitacionId: capacitacion.id,
          });
        }
      }

      if (reportesACrear.length > 0) {
        await models.Reporte.bulkCreate(reportesACrear);
      }
    }
    globalProgress.completado++;
  }
};





module.exports = {generarReporte, botonGenerarReporte};
