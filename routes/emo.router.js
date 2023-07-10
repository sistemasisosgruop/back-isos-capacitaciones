const express = require("express");

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
const service = new TrabajadorService();
const upload = multer({ dest: "excel/" });
const EmpresasService = require("../services/empresas.service.js");
const serviceEmpresa = new EmpresasService();
const moment = require("moment");

router.get("/", async (req, res, next) => {
  try {
    const Trabajadores = await service.find();
    res.json(Trabajadores);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getTrabajadorSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const trabajador = await service.findOne(id);
      res.json(trabajador);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  async (req, res, next) => {
    try {
      const body = req.body;

      const valdni = await service.findByDni(body.dni);
      if (valdni) {
        res.status(400).json({
          message: `Ya existe un Dni igual`,
        });
      } else {
        console.log(body);
        const nuevotrabajador = await service.create(body);
        res
          .status(201)
          .json(
            nuevotrabajador
              ? nuevotrabajador
              : { message: "ya existe el usuario" }
          );
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/cargaexcel/:empresaId",
  upload.single("file"),
  async (req, res, next) => {
    const id = req.params.empresaId;
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 4 });

    const datosFiltrados = datos.filter((arr) => arr.length > 0);
    const headers = datosFiltrados[0];
    const rows = datosFiltrados.slice(1);
    const trabajadores = rows.map((row) => {
      const trabajador = {};
      headers.forEach((header, index) => {
        if (header === "FECHA DE NACIMIENTO") {
          let fecha = null;
          if (typeof row[index] === "number") {
            const fechaNumerica = row[index];
            fecha = moment((fechaNumerica - (25567 + 1)) * 86400 * 1000);
          } else {
            fecha = moment(row[index], "DD/MM/YYYY", true);
          }
          trabajador[header] = fecha.isValid()
            ? fecha.format("YYYY-MM-DD")
            : null;
        } else {
          trabajador[header] = row[index];
        }
      });

      // Validación adicional de la fecha
      if (
        !trabajador["FECHA DE NACIMIENTO"] ||
        trabajador["FECHA DE NACIMIENTO"] === "Invalid date"
      ) {
        trabajador["FECHA DE NACIMIENTO"] = null;
      }

      return trabajador;
    });

    const empresa = await serviceEmpresa.findOne(id);

    if (!empresa) {
      res.json(empresa);
    } else {
      try {
        await service.createExcel(trabajadores, Number(id));
        res.status(201).json({ message: "Creado con éxito!" });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "Hubo un error.", error: error.toString() });
      }
    }
  }
);

router.patch(
  "/:id",
  validatorHandler(getTrabajadorSchema, "params"),
  validatorHandler(updateTrabajadorSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log(body);
      const trabajador = await service.update(id, body);
      res.json(trabajador);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
