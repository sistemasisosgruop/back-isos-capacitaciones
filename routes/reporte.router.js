const { Router } = require("express");

const router = Router();
const { models, sequelize } = require("./../libs/sequelize");
const passport = require("passport");
const moment = require("moment");

const { checkWorkRol } = require("./../middlewares/auth.handler");
const { Op, fn, col, where, Sequelize } = require("sequelize");
const { botonGenerarReporte } = require("../services/reporte.service");
const sequelize = require("./../libs/sequelize");
let globalProgress = { total: 0, completado: 0 };

router.get("/", async (req, res) => {
  try {

    let { page, limit, nombreEmpresa, capacitacion, mes, codigo, anio, all, dniname } = req.query;

    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    let dateCondition = {};

    if (anio && anio !== "") {
      dateCondition = {
        fechaExamen: {
          [Op.between]: [
            `${anio}-01-01`,
            `${anio}-12-31`
          ]
        }
      };
    }
    if (mes && mes !== "") {
      dateCondition = {
        fechaExamen: where(fn('date_part', 'month', col('Reporte.fecha_examen')), '=', mes)
      };
    }

    if (mes && mes !== "" && anio && anio !== "") {
      dateCondition = {
        fechaExamen: {
          [Op.between]: [
            moment().set({ year: anio, month: mes - 1, date: 1 }).startOf("day").format("YYYY-MM-DD"),
            moment().set({ year: anio, month: mes - 1 }).endOf("month").endOf("day").format("YYYY-MM-DD")
          ]
        }
      };
    }

    const empresaCondition =
      nombreEmpresa && nombreEmpresa.trim() !== ""
        ? { nombreEmpresa: { [Op.iLike]: `%${nombreEmpresa}%` } }
        : {};

    const concat = {[Op.or]: [
      sequelize.where(
        sequelize.fn('CONCAT', sequelize.col('nombres'), ' ', sequelize.col('apellidoPaterno'), ' ', sequelize.col('apellidoMaterno')),
        {
          [Op.like]: `%${dniname}%`, // dniname is the name's input
        }
      ),
    ]}
    const dninameCondition =
      dniname !== undefined && dniname !== ""
        ? dniname.length === 8 ? {dni: `${dniname}`} : concat
        : {};

    const capacitacionCondition =
      capacitacion && capacitacion.trim() !== ""
        // ? { nombre: { [Op.iLike]: `%${capacitacion}%` } }
        ? { codigo: { [Op.match]: `${capacitacion}` } }
        : {};

    const codigoCondition =
      codigo && codigo.trim() !== ""
        ? { codigo: { [Op.iLike]: `%${codigo}%` } }
        : {};
    // Set default values for page and limit

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }

    const reporte = await models.Reporte.findAndCountAll({
      distinct: true,
      where: dateCondition,
      include: [
        {
          model: models.Trabajador,
          // Add consulta where nombres y dni,
          where: {
            [Op.and]: [
              { habilitado: true },
              dninameCondition
            ]
          },
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
              as: "empresas",
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
          where: {
            ...capacitacionCondition,
            ...codigoCondition,
          },
          include: [
            {
              model: models.Empresa,
              as: 'Empresas',
              through: { attributes: [] },
              where: nombreEmpresa ? { nombreEmpresa } : {}
            }
          ]
        },
        {
          model: models.Examen,
          as: "examen",
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
      limit,
      offset,
    });
    const format = reporte?.rows?.map((item) => {
      return item?.trabajador?.empresas?.map(empresa => ({
        trabajadorId: item?.trabajador?.id,
        nombreTrabajador:
          item?.trabajador?.apellidoPaterno +
          " " +
          item?.trabajador?.apellidoMaterno +
          " " +
          item?.trabajador?.nombres,
        nombreCapacitacion: item?.capacitacion?.nombre,
        nombreEmpresa: empresa.nombreEmpresa,
        empresaId: empresa.id,
        fechaExamen: moment(item?.fechaExamen).format("DD-MM-YYYY"),
        horaExamen: moment(item?.fechaExamen).format("HH:mm"),
        notaExamen: item?.notaExamen,
        examen: item.examen,
        asistenciaExamen: item?.asistenciaExamen,
        mesExamen: moment(item?.examen?.fechadeExamen)?.month() + 1,
        examenId: item?.examen?.id,
        capacitacion: {
          codigo: item?.capacitacion?.codigo,
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
        empresa: empresa,
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
      }));
    }).flat();


    const format2 = reporte?.rows?.map((item) => {
      return {
        reporte: {
          asistenciaExamen: item?.asistenciaExamen,
        },
      }
    })

    const acumulado = format2.filter(m => m.reporte.asistenciaExamen === true)

    const pageInfo = {
      total: reporte.count,
      acumulado: acumulado.length,
      page: page,
      limit: limit,
      totalPage: Math.ceil(reporte.count / limit),
      next: parseInt(page) + 1,
    };

    // Enviar la respuesta con la paginación
    res.json({ data: format, pageInfo });
  } catch (error) {
    console.log(error);
    res.json({ message: "no encuentra reportes" });
  }
});


router.get("/constancias", async (req, res) => {
  try {
    let { page, limit, nombreEmpresa,codigo, mes, anio, all } = req.query;
    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    let dateCondition = {};
    let whereCondition = {};
    if (anio && anio !== "") {
      dateCondition = {
        fecha: {
          [Op.between]: [
            `${anio}-01-01`,
            `${anio}-12-31`
          ]
        }
      };
    }

    if (codigo && codigo !== "") {
      whereCondition = Sequelize.where(
        Sequelize.fn(
          'CONCAT',
          Sequelize.col('Constancia.trabajador_id'),
          '-',
          Sequelize.col('Constancia.serial')
        ),
        {
          [Op.iLike]: `%${codigo}%`
        }
      );
    }

    if (mes && mes !== "") {
      dateCondition = {
        fecha: where(fn('date_part', 'month', col('Constancia.fecha')), '=', mes)
      };
    }

    if (mes && mes !== "" && anio && anio !== "") {
      dateCondition = {
        fecha: {
          [Op.between]: [
            moment().set({ year: anio, month: mes - 1, date: 1 }).startOf("day").format("YYYY-MM-DD"),
            moment().set({ year: anio, month: mes - 1 }).endOf("month").endOf("day").format("YYYY-MM-DD")
          ]
        }
      };
    }

    const empresaCondition =
      nombreEmpresa && nombreEmpresa.trim() !== ""
        ? { nombreEmpresa: { [Op.iLike]: `%${nombreEmpresa}%` } }
        : {};

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }

    const constancias = await models.Constancia.findAndCountAll({
      distinct: true,
      where: {
        ...dateCondition,
        ...(codigo ? { [Op.and]: [whereCondition] } : {})
      },
      include: [
        {
          model: models.Trabajador,
          as: 'trabajador',
          attributes: [
            'id',
            'nombres',
            'apellidoMaterno',
            'apellidoPaterno',
            'dni'
          ],
          include: [{
            model: models.Emo,
            as: 'emo',
            attributes: [
              'fecha_examen',
              'fecha_vencimiento',
              'fecha_lectura'
            ]
          }]
        },
        {
          model: models.Empresa,
          as: 'empresa',
          where: empresaCondition,
          attributes: ['nombreEmpresa']
        }
      ],
      limit,
      offset,
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });

    const format = constancias.rows.map(item => ({
      trabajadorId: item.trabajador_id,
      serie: item.serial,
      fecha: moment(item.fecha).format("DD-MM-YYYY"),
      hora: moment(item.hora, "HH:mm:ss").format("HH:mm"),
      nombreTrabajador: `${item.trabajador.apellidoPaterno} ${item.trabajador.apellidoMaterno} ${item.trabajador.nombres}`,
      nombreEmpresa: item.empresa.nombreEmpresa,
      fechaExamen: item.trabajador.emo[0]?.fecha_examen 
        ? moment(item.trabajador.emo[0].fecha_examen).format("DD-MM-YYYY")
        : "",
      fechaVencimiento: item.trabajador.emo[0]?.fecha_vencimiento
        ? moment(item.trabajador.emo[0].fecha_vencimiento).format("DD-MM-YYYY")
        : "",
      fechaLectura: item.trabajador.emo[0]?.fecha_lectura
        ? moment(item.trabajador.emo[0].fecha_lectura).format("DD-MM-YYYY")
        : "",
      empresa_id: item.empresa_id,
      url: `/emo/descargar/constancia/${item.trabajador_id}`
    }));

    const pageInfo = {
      total: constancias.count,
      page: page,
      limit: limit,
      totalPage: Math.ceil(constancias.count / limit),
      next: parseInt(page) + 1,
    };

    res.status(200).json({ data: format, pageInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las constancias" });
  }
});

router.get("/capacitaciones/:dni", async (req, res) => {
  try {
    let { page, limit, capacitacion, mes, anio } = req.query;
    const { dni } = req.params;
    page = page ? parseInt(page) : 1;

    let dateCondition = {};

    if (anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            `${anio}-01-01`,
            `${anio}-12-31`
          ]
        }
      };
    }
    if (mes && mes !== "") {
      dateCondition = {
        fechadeExamen: where(fn('date_part', 'month', col('examen.fechadeExamen')), '=', mes)
      };
    }

    if (mes && mes !== "" && anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            moment().set({ year: anio, month: mes - 1, date: 1 }).startOf("day").format("YYYY-MM-DD"),
            moment().set({ year: anio, month: mes - 1 }).endOf("month").endOf("day").format("YYYY-MM-DD")
          ]
        }
      };
    }

    const capacitacionCondition =
      capacitacion && capacitacion.trim() !== ""
        ? { nombre: { [Op.iLike]: `%${capacitacion}%` } }
        : {};

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }
    
    const reporte = await models.Reporte.findAndCountAll({
      distinct: true,
      include: [
        {
          model: models.Trabajador,
          where: { 
            habilitado: true,
            dni: dni
           },
          attributes: [
            "id",
            "nombres",
            "apellidoMaterno",
            "apellidoPaterno",
            "dni",
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresas",
              attributes: [
                "id",
                "nombreEmpresa",
                "imagenLogo",
                "imagenCertificado",
              ],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: models.Capacitacion,
          as: "capacitacion",
          where: {
            ...capacitacionCondition,
          },
          include: [
            {
              model: models.Empresa,
              as: 'Empresas',
              through: { attributes: [] },
              required: true,
            }
          ],
          required: true,
        },
        {
          model: models.Examen,
          as: "examen",
          where: dateCondition,
          include: [
            { 
              model: models.Pregunta, 
              as: "pregunta",
            }
          ],
          required: true,
        },
      ],
      where: Sequelize.where(
        Sequelize.col('"trabajador->empresas"."id"'),
        '=',
        Sequelize.col('"capacitacion->Empresas"."id"')
      ),
      subQuery: false,
    });

    // Formatea los resultados para mostrar claramente la relación empresa-capacitación
    const format = reporte?.rows?.map((item) => ({
      reporteId: item.id,
      fechaExamen: moment(item.fechaExamen).format("DD-MM-YYYY"),
      horaExamen: moment(item.fechaExamen).format("HH:mm"),
      asistenciaExamen: item.asistenciaExamen,
      notaExamen: item.notaExamen,
      trabajadorId: item.trabajador.id,
      capacitacionId: item.capacitacion.id,
      empresaId: item.capacitacion.Empresas[0].id,
      trabajador: {
        id: item.trabajador.id,
        dni: item.trabajador.dni,
        nombreCompleto: `${item.trabajador.apellidoPaterno} ${item.trabajador.apellidoMaterno} ${item.trabajador.nombres}`,
        apellidoMaterno: item.trabajador.apellidoMaterno,
        apellidoPaterno: item.trabajador.apellidoPaterno,
        nombres: item.trabajador.nombres,
      },
      empresa: {
        id: item.capacitacion.Empresas[0].id,
        nombreEmpresa: item.capacitacion.Empresas[0].nombreEmpresa,
      },
      capacitacion: {
        id: item.capacitacion.id,
        nombre: item.capacitacion.nombre,
        codigo: item.capacitacion.codigo,
        horas: item.capacitacion.horas,
        fechaInicio: item.capacitacion.fechaInicio,
      },
      examen: {
        id: item.examen.id,
        fecha: moment(item.examen.fechadeExamen).format("DD-MM-YYYY"),
        nota: item.notaExamen,
      }
    }));

    res.json({ 
      data: format,
      count: reporte.count
    });

  } catch (error) {
    console.log(error);
    res.json({ message: "no encuentra reportes" });
  }
});

router.get("/reporte2", async (req, res) => {
  try {
    let { page, limit, nombreEmpresa, capacitacion, mes,codigo,anio, all } = req.query;
    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    let dateCondition = {};

    if (anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            `${anio}-01-01`,
            `${anio}-12-31`
          ]
        }
      };
    }
    if (mes && mes !== "") {
      dateCondition = {
        fechadeExamen: where(fn('date_part', 'month', col('examen.fechadeExamen')), '=', mes)
      };
    }

    if (mes && mes !== "" && anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            moment().set({ year: anio, month: mes - 1, date: 1 }).startOf("day").format("YYYY-MM-DD"),
            moment().set({ year: anio, month: mes - 1 }).endOf("month").endOf("day").format("YYYY-MM-DD")
          ]
        }
      };
    }

    const empresaCondition =
      nombreEmpresa && nombreEmpresa.trim() !== ""
        ? { nombreEmpresa: { [Op.iLike]: `%${nombreEmpresa}%` } }
        : {};

    const capacitacionCondition =
      capacitacion && capacitacion.trim() !== ""
        ? { codigo: { [Op.iLike]: `%${capacitacion}%` } }
        : {};

    const codigoCondition =
      codigo && codigo.trim() !== ""
        ? { codigo: { [Op.iLike]: `%${codigo}%` } }
        : {};
    // Set default values for page and limit

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }
    const empresa = await models.Empresa.findOne({
      where: { nombreEmpresa: { [Op.like]: `%${nombreEmpresa}%` } },
    });

    const reporte = await models.Reporte.findAndCountAll({
      distinct: true,
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
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresas",
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
          where: {
            ...capacitacionCondition,
            ...codigoCondition,
          },
          include: [
            {
              model: models.Empresa,
              as: 'Empresas',
              through: { attributes: [] }, // Esto evita que se incluyan los atributos de la tabla intermedia
              where: { nombreEmpresa: nombreEmpresa }
            }
          ]
        },
        {
          model: models.Examen,
          as: "examen",
          where: dateCondition,
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
      ...(limit && { limit }),     
      ...(offset && { offset }), 
    });
    
    const format = reporte?.rows?.map((item) => {
      return item?.trabajador?.empresas?.map(empresa => ({
        trabajadorId: item?.trabajador?.id,
        nombreTrabajador:
          item?.trabajador?.apellidoPaterno +
          " " +
          item?.trabajador?.apellidoMaterno +
          " " +
          item?.trabajador?.nombres,
        nombreCapacitacion: item?.capacitacion?.nombre,
        nombreEmpresa: empresa.nombreEmpresa,
        empresaId: empresa.id,
        fechaExamen: moment(item?.fechaExamen).format("DD-MM-YYYY"),
        horaExamen: moment(item?.fechaExamen).format("HH:mm"),
        notaExamen: item?.notaExamen,
        examen: item.examen,
        asistenciaExamen: item?.asistenciaExamen,
        mesExamen: moment(item?.examen?.fechadeExamen)?.month() + 1,
        examenId: item?.examen?.id,
        capacitacion: {
          codigo: item?.capacitacion?.codigo,
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
        empresa: empresa,
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
      }));
    }).flat();


    const pageInfo = {
      total: reporte.count,
      acumulado: acumulado.length,
      page: page,
      limit: limit,
      totalPage: Math.ceil(reporte.count / limit),
      next: parseInt(page) + 1,
    };

    // Enviar la respuesta con la paginación
    res.json({ data: format, pageInfo });
  } catch (error) {
    console.log(error);
    res.json({ message: "no encuentra reportes" });
  }
});

router.get("/generar", async (req, res) => {
  try {
    await botonGenerarReporte(globalProgress);
    res.json({ message: 'Se generaron los reportes correctamente!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo generar los reportes' });
  }
});

router.get('/progreso', (req, res) => {
  res.json(globalProgress);
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

      // Validaciones básicas
      if (!trabajador || !examen || !capacitacion) {
        return res.status(404).json({ message: "Recurso no encontrado" });
      }

      if (trabajador.habilitado === false) {
        return res.status(403).json({
          message: "No puede dar el examen porque está deshabilitado",
        });
      }

      // Verificar si ya existe un intento previo
      const intentoPrevio = await models.Reporte.findOne({
        where: {
          trabajadorId: trabajador.id,
          capacitacionId: capacitacion.id,
          asistenciaExamen: true
        }
      });

      // Calcular nota
      let notaExamen = 0;
      const respuestasPorPregunta = {};
      respuestas.forEach((respuesta) => {
        respuestasPorPregunta[respuesta.preguntaId] = respuesta.respuesta;
      });

      examen.pregunta.forEach((pregunta) => {
        const respuesta = respuestasPorPregunta[pregunta.id];
        if (respuesta === pregunta.respuesta_correcta) {
          notaExamen += pregunta.puntajeDePregunta;
        }
      });

      // Buscar o crear el reporte
      let reporte = await models.Reporte.findOne({
        where: {
          trabajadorId: trabajador.id,
          capacitacionId: capacitacion.id,
          examenId: examen.id,
        },
      });

      if (!reporte) {
        reporte = await models.Reporte.create({
          trabajadorId: trabajador.id,
          capacitacionId: capacitacion.id,
          examenId: examen.id,
        });
      }

      // Actualizar el reporte
      const reporteActualizado = await reporte.update({
        notaExamen,
        fechaExamen: moment().tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'),
        asistenciaExamen: true,
        isRecuperacion: !!(intentoPrevio),
        rptpregunta1: examen.pregunta[0]
          ? respuestasPorPregunta[examen.pregunta[0].id] || 0
          : 0,
        rptpregunta2: examen.pregunta[1]
          ? respuestasPorPregunta[examen.pregunta[1].id] || 0
          : 0,
        rptpregunta3: examen.pregunta[2]
          ? respuestasPorPregunta[examen.pregunta[2].id] || 0
          : 0,
        rptpregunta4: examen.pregunta[3]
          ? respuestasPorPregunta[examen.pregunta[3].id] || 0
          : 0,
        rptpregunta5: examen.pregunta[4]
          ? respuestasPorPregunta[examen.pregunta[4].id] || 0
          : 0,
      });


      res.json(reporteActualizado);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

router.get("/recuperacion", async (req, res) => {
  try {
    let { page, limit, nombreEmpresa, capacitacion, mes, codigo, anio, all } = req.query;
    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    let dateCondition = {};

    if (anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            `${anio}-01-01`,
            `${anio}-12-31`
          ]
        }
      };
    }

    if (mes && mes !== "") {
      dateCondition = {
        fechadeExamen: where(fn('date_part', 'month', col('examen.fechadeExamen')), '=', mes)
      };
    }

    if (mes && mes !== "" && anio && anio !== "") {
      dateCondition = {
        fechadeExamen: {
          [Op.between]: [
            moment().set({ year: anio, month: mes - 1, date: 1 }).startOf("day").format("YYYY-MM-DD"),
            moment().set({ year: anio, month: mes - 1 }).endOf("month").endOf("day").format("YYYY-MM-DD")
          ]
        }
      };
    }

    const empresaCondition =
      nombreEmpresa && nombreEmpresa.trim() !== ""
        ? { nombreEmpresa: { [Op.iLike]: `%${nombreEmpresa}%` } }
        : {};

    const capacitacionCondition =
      capacitacion && capacitacion.trim() !== ""
        ? { nombre: { [Op.iLike]: `%${capacitacion}%` } }
        : {};

    const codigoCondition =
      codigo && codigo.trim() !== ""
        ? { codigo: { [Op.iLike]: `%${codigo}%` } }
        : {};

    const reporte = await models.Reporte.findAndCountAll({
      distinct: true,
      where: {
        isRecuperacion: true
      },
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
          ],
          as: "trabajador",
          include: [
            {
              model: models.Empresa,
              as: "empresas",
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
          where: {
            ...capacitacionCondition,
            ...codigoCondition,
          },
        },
        {
          model: models.Examen,
          as: "examen",
          where: dateCondition,
          include: [{ model: models.Pregunta, as: "pregunta" }],
        },
      ],
      limit,
      offset,
    });

    const format = reporte?.rows?.map((item) => {
      return item?.trabajador?.empresas?.map(empresa => ({
        trabajadorId: item?.trabajador?.id,
        nombreTrabajador:
          item?.trabajador?.apellidoPaterno +
          " " +
          item?.trabajador?.apellidoMaterno +
          " " +
          item?.trabajador?.nombres,
        nombreCapacitacion: item?.capacitacion?.nombre,
        nombreEmpresa: empresa.nombreEmpresa,
        empresaId: empresa.id,
        fechaExamen: moment(item?.fechaExamen).format("DD-MM-YYYY"),
        horaExamen: moment(item?.fechaExamen).format("HH:mm"),
        notaExamen: item?.notaExamen,
        examen: item.examen,
        asistenciaExamen: item?.asistenciaExamen,
        mesExamen: moment(item?.examen?.fechadeExamen)?.month() + 1,
        examenId: item?.examen?.id,
        capacitacion: {
          codigo: item?.capacitacion?.codigo,
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
        capacitacionId: item?.capacitacion?.id,
        pregunta: item?.examen?.pregunta.sort((a, b) => {
          const numA = a.texto ? parseInt(a.texto.split(".")[0]) : 0;
          const numB = b.texto ? parseInt(b.texto.split(".")[0]) : 0;
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
        empresa: empresa,
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
      }));
    }).flat();

    const pageInfo = {
      total: reporte.count,
      page: page,
      limit: limit,
      totalPage: Math.ceil(reporte.count / limit),
      next: parseInt(page) + 1,
    };

    res.json({ data: format, pageInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener reportes de recuperación" });
  }
});

router.get("/:id", async (req, res) => {
  try {
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
      // console.log(reporte);
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
