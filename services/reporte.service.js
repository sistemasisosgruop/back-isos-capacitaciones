const { Op } = require("sequelize");
const { models } = require("./../libs/sequelize");

const generarReporte = async () => {
  const capacitaciones = await models.Capacitacion.findAll({
    where: { habilitado: true },
    include: ["examen", "Empresas"],
  });

  let reporteData = []; // Array to store report data objects

  // Iterar sobre cada capacitación
  for (const capacitacion of capacitaciones) {
    if (capacitacion.Empresas.length && capacitacion.examen) {
      const empresas = capacitacion.Empresas;

      // Buscar todos los trabajadores de las empresas asociadas
      const trabajadores = await models.Trabajador.findAll({
        where: {
          empresa_id: {
            [Op.in]: empresas.map((empresa) => empresa.id),
          },
        },
      });

      // Identificar reportes existentes para esta capacitacion
      const existingReportIds = await models.Reporte.findAll({
        attributes: ["id"],
        where: {
          trabajador_id: {
            [Op.in]: trabajadores.map((trabajador) => trabajador.id),
          },
          capacitacionId: capacitacion.id,
        },
      });

      // Preparar datos de reportes para crear o actualizar
      reporteData = trabajadores
        .map((trabajador) => {
          if (
            !existingReportIds.some((report) => report.id === trabajador.id)
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
              examenId: capacitacion.examen.id,
              capacitacionId: capacitacion.id,
            };
          }
          return null; // Skip worker if report exists
        })
        .filter((reporte) => reporte !== null); // Remove null values
    }
  }

  // Crear o actualizar reportes en masa
  if (reporteData.length) {
    const existingReportIds = reporteData.map((reporte) => reporte.id);

    await models.Reporte.bulkCreate(
      reporteData.filter((reporte) => !existingReportIds.includes(reporte.id))
    );
  }
};

module.exports = generarReporte;
