const { Op } = require("sequelize");
const { models } = require("./../libs/sequelize");

const  generarReporte = async() => {
    const capacitaciones = await models.Capacitacion.findAll({
      where: { habilitado: true },
      include: ["examen", "Empresas"],
    });

    const reportData = [];
    for (const capacitacion of capacitaciones) {
      if (capacitacion.Empresas.length && capacitacion.examen) {
        const empresas = capacitacion.Empresas;
        const trabajadores = await models.Trabajador.findAll({
          where: {
            empresa_id: {
              [Op.in]: empresas.map((empresa) => empresa.id),
            },
          },
        });

        const existingReportIds = await models.Reporte.findAll({
          attributes: ["id"],
          where: {
            trabajador_id: {
              [Op.in]: trabajadores.map((trabajador) => trabajador.id),
            },
            capacitacionId: capacitacion.dataValues.id,
          },
        });

        for (const trabajador of trabajadores) {
          if (!existingReportIds.some((report) => report.id === trabajador.id)) {
            reportData.push({
              notaExamen: 0,
              asistenciaExamen: false,
              rptpregunta1: 0,
              rptpregunta2: 0,
              rptpregunta3: 0,
              rptpregunta4: 0,
              rptpregunta5: 0,
              trabajadorId: trabajador.dataValues.id,
              examenId: capacitacion.dataValues.examen.dataValues.id,
              capacitacionId: capacitacion.dataValues.id,
            });
          }
        }
      }
    }

    if (reportData.length) {
        await models.Reporte.bulkCreate(reportData);
    }

}


module.exports = generarReporte;
