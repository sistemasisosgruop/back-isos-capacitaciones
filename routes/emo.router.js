const express = require("express");
const { models } = require("./../libs/sequelize");
const xlsx = require("xlsx");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "excel/" });
const emo = multer({ dest: "emo/" });
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { transporter } = require('./../config/mailer');
const buildPDF = require("../libs/pdfkit");

router.get("/", async (req, res) => {
  try {
    const Trabajadores = await models.Trabajador.findAll({
      include: [
        { model: models.Emo, as: "emo" },
        { model: models.Empresa, as: "empresa" },
        { model: models.registroDescarga, as: "registroDescarga" },
      ],
    });

    // console.log(Trabajadores)
    const newData = Trabajadores?.map((item, index) => {
      return {
        nro: index + 1,
        id: item?.emo?.at(0)?.id,
        trabajador_id: item?.id,
        apellidoPaterno: item?.apellidoPaterno,
        apellidoMaterno: item?.apellidoMaterno,
        nombres: item?.nombres,
        dni: item?.dni,
        celular: item?.celular,
        email: item?.email,
        edad: item?.edad,
        area: item?.areadetrabajo,
        cargo: item?.cargo,
        fecha_examen: item?.emo?.at(0)?.fecha_examen
          ? moment(item?.emo?.at(0)?.fecha_examen, [
              "YYYY-MM-DD",
              "DD-MM-YYYY",
            ]).format("YYYY-MM-DD")
          : "",
        condicion_aptitud: item?.emo?.at(0)?.condicion_aptitud,
        clinica: item?.emo?.at(0)?.clinica,
        fecha_lectura: item?.emo?.at(0)?.fecha_lectura
          ? moment(item?.emo?.at(0)?.fecha_lectura, [
              "YYYY-MM-DD",
              "DD-MM-YYYY",
            ]).format("YYYY-MM-DD")
          : "",
        logo: item?.empresa?.imagenLogo,
        nombreEmpresa: item?.empresa?.nombreEmpresa,
        empresa_id: item?.empresa?.id,
        fecha_email: item?.emo?.at(0)?.fecha_email
          ? moment(item?.emo?.at(0)?.fecha_email, [
              "YYYY-MM-DD HH:mm:ss",
              "DD-MM-YYYY HH:mm:ss",
            ]).format("YYYY-MM-DD HH:mm:ss")
          : "",
        estado_email: item?.emo?.at(0)?.estado_email,
        fecha_whatsapp: item?.emo?.at(0)?.fecha_whatsapp
          ? moment(item?.emo?.at(0)?.fecha_whatsapp, [
              "YYYY-MM-DD HH:mm:ss",
              "DD-MM-YYYY HH:mm:ss",
            ]).format("YYYY-MM-DD HH:mm:ss")
          : "",
        estado_whatsapp: item?.emo?.at(0)?.estado_whatsapp,
        fecha_emo: item?.emo?.at(0)?.fecha_emo
          ? moment(item?.emo?.at(0)?.fecha_emo, [
              "YYYY-MM-DD HH:mm:ss",
              "DD-MM-YYYY HH:mm:ss",
            ]).format("YYYY-MM-DD HH:mm:ss")
          : "",
        estado_emo: item?.emo?.at(0)?.estado_emo,
        fecha_emo_whatsapp: item?.emo?.at(0)?.fecha_emo_whatsapp
          ? moment(item?.emo?.at(0)?.fecha_emo_whatsapp, [
              "YYYY-MM-DD HH:mm:ss",
              "DD-MM-YYYY HH:mm:ss",
            ]).format("YYYY-MM-DD HH:mm:ss")
          : "",
        estado_emo_whatsapp: item?.emo?.at(0)?.estado_emo_whatsapp,
        estado: item?.emo?.at(0)?.estado,
        registroDescarga: item.registroDescarga
      };
    });

    return res.status(200).json({ data: newData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "No se pudo obtener los trabajadores." });
  }
});

router.get("/reporte", async (req, res) => {
  try {
    let { page, limit, nombreEmpresa, search, all } = req.query;
    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    const empresaCondition =
      nombreEmpresa !== undefined && nombreEmpresa !== ""
        ? { nombreEmpresa: { [Op.like]: `%${nombreEmpresa}%` } }
        : {};
    const searchCondition =
      search !== undefined && search !== ""
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn(
                  "LOWER",
                  Sequelize.fn(
                    "CONCAT",
                    Sequelize.col("apellidoPaterno"),
                    " ",
                    Sequelize.col("apellidoMaterno"),
                    " ",
                    Sequelize.col("nombres")
                  )
                ),
                { [Op.like]: `%${search.toLowerCase()}%` }
              ),
              { dni: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }

    const reportes = await models.registroDescarga.findAndCountAll({
      include: [
        {
          model: models.Trabajador,
          as: "trabajador",
          attributes: ["id", "nombres", "apellidoPaterno", "apellidoMaterno"],
          where: searchCondition,

          include: [
            {
              model: models.Empresa,
              where: empresaCondition,
              as: "empresa",
              attributes: ["nombreEmpresa"],
            },
          ],
        },
      ],
      limit,
      offset,
    });

    const formatData = reportes?.rows?.map((item) => {
      return {
        id: item?.id,
        trabajador_id: item?.trabajador_id,
        fecha: item?.fecha,
        hora: item?.hora,
        apellidoMaterno: item?.trabajador?.apellidoMaterno,
        apellidoPaterno: item?.trabajador?.apellidoPaterno,
        nombre: item?.trabajador?.nombres,
        empresa: item?.trabajador?.empresa?.nombreEmpresa,
      };
    });
    const pageInfo = {
      total: reportes.count,
      page: page,
      limit: limit,
      totalPage: Math.ceil(reportes.count / limit),
    };
    res.json({ data: formatData, pageInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json("No se pudo obtener los reportes");
  }
});

router.get("/reporte-descarga/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const Trabajadores = await models.Trabajador.findAll({
      include: [
        { model: models.registroDescarga, as: "registroDescarga" },
        { model: models.Empresa, as: "empresa" },
      ],
      where: { id }
    });

    return res.status(200).json({ data: Trabajadores });

  } catch (error) {
    console.log(error);
    return res.status(500).json("No se pudo obtener los registros");
  }
});

router.get("/registro-whatsapp/:id", async (req, res, next) => {
  
  try {
    const { id } = req.params;
    console.log(id);
    const Trabajadores = await models.registroDescarga.findAll({
      where: { trabajador_id: id, tipo: 'whatsapp' }
    });

    return res.status(200).json({ data: Trabajadores });

  } catch (error) {
    console.log(error);
    return res.status(500).json("No se pudo obtener los registros");
  }
});


router.get("/descargar/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // Construye la ruta del archivo PDF basado en el ID
  const filePath = path.join(__dirname, "..", "emo", `${id}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader({
    'Content-Disposition': 'attachment; filename=' + id + '.pdf',
   });
  // Envía el archivo como respuesta de descarga
  res.download(filePath, `${id}.pdf`, async (err) => {
    if (err) {
      console.log(err);
      res.status(500).json("Error al descargar el PDF.");
    } else {
      try {
        const data = {
          trabajador_id: parseInt(id),
          fecha: moment().format("DD-MM-YYYY"),
          hora: moment().format("HH:mm:ss"),
          tipo: 'emo'
        };
        // console.log(data);
        // Registra el nuevo registro de descarga en la tabla registro_descargas
        await models.registroDescarga.create(data);
        res.send(data);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

router.get("/descargar/constancia/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // Construye la ruta del archivo PDF basado en el ID
  const filePath = path.join(__dirname, "..", "constancia", `${id}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader({
    'Content-Disposition': 'attachment; filename=' + id + '.pdf',
   });
  // Envía el archivo como respuesta de descarga
  res.download(filePath, `${id}.pdf`, async (err) => {
    if (err) {
      console.log(err);
      res.status(500).json("Error al descargar el PDF.");
    } else {
      try {
        const data = {
          trabajador_id: parseInt(id),
          fecha: moment().format("DD-MM-YYYY"),
          hora: moment().format("HH:mm:ss"),
          tipo: 'constancia'
        };
        // console.log(data);
        // Registra el nuevo registro de descarga en la tabla registro_descargas
        await models.registroDescarga.create(data);
        // res.send(data);
      } catch (error) {
        console.log(error);
      }
    }
  });
});
router.get("/descargar/emo/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // Construye la ruta del archivo PDF basado en el ID
  const filePath = path.join(__dirname, "..", "emo", `${id}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  // Envía el archivo como respuesta de descarga
  res.download(filePath, `${id}.pdf`, async (err) => {
    if (err) {
      console.log(err);
      res.status(500).json("Error al descargar el PDF.");
    } else {
      try {
        const data = {
          trabajador_id: parseInt(id),
          fecha: moment().format("DD-MM-YYYY"),
          hora: moment().format("HH:mm:ss"),
          tipo: 'emo-whatsapp'
        };
        // console.log(data);
        // Registra el nuevo registro de descarga en la tabla registro_descargas
        await models.registroDescarga.create(data);
        res.send(data);
      } catch (error) {
        console.log(error);
      }
    }
  });
});

function excelSerialDateToJSDate(serial) {
  var days = serial - (25567 + 2);
  var date = new Date(days * 24 * 60 * 60 * 1000);

  // Compensar la diferencia horaria
  var timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  date = new Date(date.getTime() + timezoneOffset);

  return date;
}

router.post("/subir/:id", emo.single("file"), async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;

    // Obtener el trabajador
    const trabajador = await models.Trabajador.findOne({ where: { id: id } });

    if (trabajador && file) {
      // Si el campo emoPdf no está vacío, intentar eliminar el archivo existente
      if (trabajador.emoPdf) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "emo",
          trabajador.emoPdf
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Generar una nueva ruta y mover el archivo a esa ubicación
      const newFileName = `${id}.pdf`;
      const newFilePath = path.join(__dirname, "..", "emo", newFileName);
      fs.renameSync(file.path, newFilePath);

      // Actualizar el campo emoPdf del trabajador en la base de datos
      trabajador.emoPdf = newFileName;
      await trabajador.save();

      return res.status(200).json("Se guardó correctamente el PDF.");
    } else {
      return res.status(400).json("No se pudo guardar el PDF.");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error al guardar el PDF.");
  }
});

router.post("/excel", upload.single("file"), async (req, res, next) => {
  try {
    const id = req.params.empresaId;
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 2 });

    const datosFiltrados = datos.filter((arr) => arr.length > 0);
    const headers = datosFiltrados[0];

    const camposHeader = [
      "DNI",
      "Fecha de Examen Médico",
      "Condición de Aptitud",
      "Clinica donde paso EMO",
      "Fecha de Lectura de EMO",
      "Estado",
    ];

    const camposBD = {
      DNI: "trabajadorId",
      "Fecha de Examen Médico": "fecha_examen",
      "Condición de Aptitud": "condicion_aptitud",
      "Clinica donde paso EMO": "clinica",
      "Fecha de Lectura de EMO": "fecha_lectura",
      "Estado": "estado",
    };

    const datosObjetos = datosFiltrados.slice(1).map((row) => {
      let obj = {};
      row.forEach((item, index) => {
        if (camposHeader.includes(headers[index])) {
          if (item === null || item === undefined) {
            // Si el valor es null o undefined, establecer como "completar"
            obj[camposBD[headers[index]]] = "completar";
          } else if (headers[index] === "DNI") {
            obj[camposBD[headers[index]]] = String(item);
          } else if (
            headers[index] === "Fecha de Examen Médico" ||
            headers[index] === "Fecha de Lectura de EMO"
          ) {
            let fecha;
            if (typeof item === "number") {
              // si es un número de serie
              const fechaExcel = excelSerialDateToJSDate(item);
              fecha = moment(fechaExcel).format("DD-MM-YYYY");
            } else if (typeof item === "string") {
              // si es una fecha en texto
              fecha = moment(item).format("DD-MM-YYYY");
            } else if (item instanceof Date) {
              // si es una fecha en formato fecha
              fecha = moment(item).format("DD-MM-YYYY");
            }

            obj[camposBD[headers[index]]] = fecha;
          } else {
            obj[camposBD[headers[index]]] = item;
          }
        }
      });
      return obj;
    });

    const dnis = datosObjetos.map((item) => item.trabajadorId);
    const trabajadores = await models.Trabajador.findAll({
      where: { dni: { [Op.in]: dnis } },
    });

    let trabajadoresMap = {};
    trabajadores.forEach((trabajador) => {
      trabajadoresMap[trabajador.dni] = trabajador;
    });

    const emos = await models.Emo.findAll({
      where: { trabajadorId: { [Op.in]: dnis } },
    });

    let emosMap = {};
    emos.forEach((emo) => {
      emosMap[emo.trabajadorId] = emo;
    });

    // Ahora procesamos los datos del Excel
    datosObjetos.forEach((obj) => {
      const trabajador = trabajadoresMap[obj.trabajadorId];
      const emo = emosMap[obj.trabajadorId];

      // Verificar si el DNI del trabajador existe en la base de datos
      if (trabajador) {
        if (emo) {
          // Actualizar el registro Emo
          emo.update(obj);
        } else {
          // Crear un nuevo registro Emo
          models.Emo.create(obj);
        }
      } else {
        console.log(
          `El DNI ${obj.trabajadorId} no está registrado en la base de datos.`
        );
      }
    });
    return res.status(200).send({ msg: "Registros guardados con éxito!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ data: "No se pudo cargar el excel." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    console.log(body, id);
    await models.Emo.update(body, { where: { trabajadorId: id } });
    res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar." });
  }
});

router.post("/constancia", async (req, res) => {
  // co3
  const data = req.body;
  buildPDF(data, 'constancia');
  res.status(200).json({ msg: "Constancia EMO creada con éxito!" });
});

router.post("/send-email", async (req, res) => {
  const body = req.body;
  buildPDF(body, 'constancia');
  // console.log(body);
  let mailOption = {
    from: process.env.USER_GMAIL_ENV,
    to: body.email,
    subject: 'Envio de Constancia Examén Médico Ocupacional',
    html: `<p>Saludos cordiales</p> <h5>${body.nombres} ${body.apellidoPaterno} ${body.apellidoMaterno}</h5><p>Nos es grato contactarnos con usted vía correo electrónico y le hacemos llegar la Constancia de entrega y lectura de Resultados de Examén Médico Ocupacional.</p><p>Atentamente.</p><h5>${ body.nombreEmpresa }</h5>`,
    attachments:[
      {
        filename: 'pdf',
        path: `constancia/${body.trabajador_id}.pdf`
      }
    ]
  }

  const data = {
    fecha_email: moment().format("DD-MM-YYYY HH:mm:ss"),
    estado_email: 'Enviado'
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log('Ocurrió un error ' + error);
    } else {
      console.log('Email enviado correctamente a ' + mailOption.to);

      try {
        const dataRegister = {
          trabajador_id: parseInt(body.trabajador_id),
          fecha: moment().format("DD-MM-YYYY"),
          hora: moment().format("HH:mm:ss"),
          tipo: 'email',
        };
        // Registra el nuevo registro de descarga en la tabla registro_descargas
        await models.registroDescarga.create(dataRegister);
      } catch (error) {
        console.log(error);
      }
      // console.log(body.dni);
      await models.Emo.update(data, { where: { trabajadorId: body.dni } });
      res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
    }
  });
});

router.post("/send-emo-email", async (req, res) => {
  const body = req.body;
  // buildPDF(body, 'emo');
  // console.log(body);
  let mailOption = {
    from: process.env.USER_GMAIL_ENV,
    to: body.email,
    subject: 'Envio del Examén Médico Ocupacional',
    html: `<p>Saludos cordiales</p> <h5>${body.nombres} ${body.apellidoPaterno} ${body.apellidoMaterno}</h5><p>Nos es grato contactarnos con usted vía correo electrónico y le hacemos llegar su Examén Médico Ocupacional.</p><p>Atentamente.</p><h5>${ body.nombreEmpresa }</h5>`,
    attachments:[
      {
        filename: 'pdf',
        path: `emo/${body.trabajador_id}.pdf`
      }
    ]
  }

  const data = {
    fecha_emo: moment().format("DD-MM-YYYY HH:mm:ss"),
    estado_emo: 'Enviado'
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log('Ocurrió un error ' + error);
    } else {
      console.log('Email enviado correctamente a ' + mailOption.to);

      try {
        const dataRegister = {
          trabajador_id: parseInt(body.trabajador_id),
          fecha: moment().format("DD-MM-YYYY"),
          hora: moment().format("HH:mm:ss"),
          tipo: 'emo',
        };
        // Registra el nuevo registro de descarga en la tabla registro_descargas
        await models.registroDescarga.create(dataRegister);
      } catch (error) {
        console.log(error);
      }
      // console.log(body.dni);
      await models.Emo.update(data, { where: { trabajadorId: body.dni } });
      res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
    }
  });
});
router.post("/send-whatsapp", async(req, res) => {
  const body = req.body;

  const data = {
    fecha_whatsapp: moment().format("DD-MM-YYYY HH:mm:ss"),
    estado_whatsapp: 'Enviado'
  };

  console.log('Whatsapp enviado correctamente a ' + body.celular);

  try {
    buildPDF(body, 'constancia');

    const dataRegister = {
      trabajador_id: parseInt(body.trabajador_id),
      fecha: moment().format("DD-MM-YYYY"),
      hora: moment().format("HH:mm:ss"),
      tipo: 'whatsapp',
    };
    // Registra el nuevo registro de descarga en la tabla registro_descargas
    await models.registroDescarga.create(dataRegister);
    // res.status(200).json({ msg: "Constancia EMO creada y enviada con éxito!" });
  } catch (error) {
    console.log(error);
  }
  // console.log(body.dni);
  await models.Emo.update(data, { where: { trabajadorId: body.dni } });
  res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
});
router.post("/send-emo-whatsapp", async(req, res) => {
  const body = req.body;

  const data = {
    fecha_emo_whatsapp: moment().format("DD-MM-YYYY HH:mm:ss"),
    estado_emo_whatsapp: 'Enviado'
  };

  console.log('Whatsapp enviado correctamente a ' + body.celular);

  try {
    // buildPDF(body, 'emo');

    const dataRegister = {
      trabajador_id: parseInt(body.trabajador_id),
      fecha: moment().format("DD-MM-YYYY"),
      hora: moment().format("HH:mm:ss"),
      tipo: 'emo-whatsapp',
    };
    // Registra el nuevo registro de descarga en la tabla registro_descargas
    await models.registroDescarga.create(dataRegister);
    // res.status(200).json({ msg: "Constancia EMO creada y enviada con éxito!" });
  } catch (error) {
    console.log(error);
  }
  // console.log(body.dni);
  await models.Emo.update(data, { where: { trabajadorId: body.dni } });
  res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
});

module.exports = router;
