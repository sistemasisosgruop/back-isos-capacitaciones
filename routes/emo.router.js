const express = require("express");
const { models } = require("./../libs/sequelize");

const TrabajadorService = require("./../services/trabajador.service");
const validatorHandler = require("./../middlewares/validator.handler");
const {
  updateTrabajadorSchema,
  createTrabajadorSchema,
  getTrabajadorSchema,
} = require("./../schemas/trabajadores.schema");
const xlsx = require("xlsx");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "excel/" });
const moment = require("moment");
const { Op } = require("sequelize");
const path = require("path");

router.get("/", async (req, res) => {
  try {
    const Trabajadores = await models.Trabajador.findAll({
      include: [
        { model: models.Emo, as: "emo" },
        { model: models.Empresa, as: "empresa" },
      ],
    });
    const newData = Trabajadores.map((item) => {
      return {
        id: item?.emo?.at(0)?.id,
        apellidoPaterno: item?.apellidoPaterno,
        apellidoMaterno: item?.apellidoMaterno,
        nombres: item?.nombres,
        dni: item?.dni,
        edad: item?.edad,
        area: item?.areadetrabajo,
        cargo: item?.cargo,
        fecha_examen: item?.emo?.at(0)?.fecha_examen,
        condicion_aptitud: item?.emo?.at(0)?.condicion_aptitud,
        clinica: item?.emo?.at(0)?.clinica,
        fecha_lectura: item?.emo?.at(0)?.fecha_lectura,
        logo: item.empresa.imagenLogo,
        nombreEmpresa: item?.empresa?.nombreEmpresa,
        empresa_id: item?.empresa?.id,
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

function excelSerialDateToJSDate(serial) {
  var days = serial - (25567 + 2);
  var date = new Date(days * 24 * 60 * 60 * 1000);

  // Compensar la diferencia horaria
  var timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  date = new Date(date.getTime() + timezoneOffset);

  return date;
}
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
    ];

    const camposBD = {
      DNI: "trabajadorId",
      "Fecha de Examen Médico": "fecha_examen",
      "Condición de Aptitud": "condicion_aptitud",
      "Clinica donde paso EMO": "clinica",
      "Fecha de Lectura de EMO": "fecha_lectura",
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
        if (obj.condicion_aptitud) {
          // Eliminar espacios en blanco del campo "condicion_aptitud"
          obj.condicion_aptitud = obj.condicion_aptitud.replace(/\s+/g, "");
        }
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
    console.log(body);
    await models.Emo.update(body, { where: { trabajadorId: id } });
    res.status(200).json({ msg: "Se actualizaron los datos con éxito!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar." });
  }
});

module.exports = router;
