const express = require("express");

const TrabajadorService = require("./../services/trabajador.service");
const EmoService = require("../services/emo.service.js");
const validatorHandler = require("./../middlewares/validator.handler");
const {
  updateTrabajadorSchema,
  createTrabajadorSchema,
  getTrabajadorSchema,
} = require("./../schemas/trabajadores.schema");
const bcrypt = require("bcrypt");

const xlsx = require("xlsx");
const multer = require("multer");
const router = express.Router();
const service = new TrabajadorService();
const serviceEmo = new EmoService();
const upload = multer({ dest: "excel/" });
const EmpresasService = require("../services/empresas.service.js");
const serviceEmpresa = new EmpresasService();
const { models } = require("./../libs/sequelize");

const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const sequelize = require("../libs/sequelize");

/**
 * @swagger
 * components:
 *   schemas:
 *     Trabajador:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido
 *         - correo
 *         - fecha_nacimiento
 *         - dni
 *         - fecha_ingreso
 *         - puesto
 *         - departamento
 *         - telefono
 *         - direccion
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único del trabajador.
 *         nombre:
 *           type: string
 *           description: Nombre del trabajador.
 *         apellido:
 *           type: string
 *           description: Apellido del trabajador.
 *         correo:
 *           type: string
 *           description: Correo electrónico del trabajador.
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del trabajador.
 *         dni:
 *           type: string
 *           description: DNI del trabajador.
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           description: Fecha de ingreso a la empresa del trabajador.
 *         puesto:
 *           type: string
 *           description: Puesto que ocupa el trabajador en la empresa.
 *         departamento:
 *           type: string
 *           description: Departamento al que pertenece el trabajador en la empresa.
 *         telefono:
 *           type: string
 *           description: Número de teléfono del trabajador.
 *         direccion:
 *           type: string
 *           description: Dirección del trabajador.
 *       example:
 *         nombre: John
 *         apellido: Doe
 *         correo: john.doe@example.com
 *         fecha_nacimiento: 1990-01-01
 *         dni: 12345678A
 *         fecha_ingreso: 2021-01-01
 *         puesto: Desarrollador
 *         departamento: Tecnología
 *         telefono: 123456789
 *         direccion: Calle Falsa 123
 */

/**
 * @swagger
 * /api/v1/trabajadores:
 *   get:
 *     summary: Obtiene todos los trabajadores.
 *     tags: [Trabajadores]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Lista de trabajadores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trabajador'
 */
router.get("/", async (req, res, next) => {
  try {
    let { page, limit, nombreEmpresa, search, all } = req.query;

    // Convertir page y limit a enteros o usar valores predeterminados
    page = page ? parseInt(page) : 1;
    limit = all === "true" ? null : limit ? parseInt(limit) : 15;
    const offset = all === "true" ? null : (page - 1) * limit;

    // Condición para el nombre de la empresa
    const empresaCondition =
      nombreEmpresa && nombreEmpresa.trim() !== ""
        ? {
            "nombreEmpresa": nombreEmpresa,
          }
        : {};

    // Condición de búsqueda
    const searchCondition =
      search && search.trim() !== ""
        ? {
            [Op.or]: [
              Sequelize.literal(
                `CONCAT(LOWER("Trabajador"."apellidoPaterno"), ' ', LOWER("Trabajador"."apellidoMaterno"), ' ', LOWER("Trabajador"."nombres")) LIKE '%${search}%'`
              ),
              { dni: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

    // Validar que la página es mayor o igual a 1
    if (page < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }

    // Buscar trabajadores con las condiciones y las asociaciones
    const Trabajadores = await models.Trabajador.findAndCountAll({
      where: {
        ...searchCondition,
      },
      include: [
        {
          model: models.Empresa,
          as: "empresas",
          through: { attributes: [] },
          where: empresaCondition, 
        },
        { model: models.Usuario, as: "user" },
      ],
      order: [["id", "ASC"]],
      limit,
      offset,
    });

    // Información de paginación
    const pageInfo = {
      total: Trabajadores.count,
      page: page,
      limit: limit || Trabajadores.count,
      totalPage: limit ? Math.ceil(Trabajadores.count / limit) : 1,
    };

    // Enviar respuesta
    res.json({ data: Trabajadores.rows, pageInfo });
  } catch (error) {
    next(error);
  }
});



router.get("/empresa", async (req, res, next) => {
  try {
    let { nombreEmpresa } = req.query;
    const empresaCondition = nombreEmpresa
      ? { nombreEmpresa: nombreEmpresa }
      : {};

    const trabajadores = await models.Trabajador.findAll({
      include: [
        {
          model: models.Empresa,
          as: "empresas",
          through: { attributes: [] },
          where: empresaCondition,
        },
        { model: models.Usuario, as: "user" },
      ],
      order: [['id', 'ASC']],
    });

    res.json({ data: trabajadores });
  } catch (error) {
    next(error);
  }
});
/**
 * @swagger
 * /api/v1/trabajadores/{id}:
 *   get:
 *     summary: Obtiene un trabajador por su ID.
 *     tags: [Trabajadores]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID del trabajador a buscar.
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trabajador encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trabajador'
 *       404:
 *         description: Trabajador no encontrado.
 */
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



/**
 * @swagger
 * /api/v1/trabajadores:
 *   post:
 *     summary: Crea un nuevo trabajador.
 *     tags: [Trabajadores]
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: Objeto JSON que representa al nuevo trabajador.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrabajadorInput'
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trabajador'
 *       400:
 *         description: El DNI ya existe en la base de datos.
 */
router.post(
  "/",
  validatorHandler(createTrabajadorSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const valdni = await service.findByDni(body.dni);
      if (valdni) {
        return res.status(400).json({ message: "Ya existe un Dni igual" });
      }
      const nuevotrabajador = await service.create(body);
      res.status(201).json(nuevotrabajador || { message: "ya existe el usuario" });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/comparar", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const body = req.body;
    const responses = [];

    const format = body.map((item) => ({
      apellidoPaterno: item?.apellidoPaterno || "sin apellido paterno",
      apellidoMaterno: item?.apellidoMaterno || "sin apellido materno",
      nombres: item?.nombres || "sin nombres",
      dni: item?.dni.toString(),
      email: item?.email || "",
      contraseña: item?.dni.toString(),
      celular: item?.celular || 0,
      genero: item?.sexo || "sin genero",
      edad: parseInt(item?.edad) || 0,
      fechadenac: item?.fechaNacimiento || null,
      areadetrabajo: item?.tipo || "sin area",
      cargo: item?.cargo || "sin cargo",
      empresaId: item?.empresa_id,
      fecha_examen: item?.fechaExamen || null,
      fecha_vencimiento: item?.fechaVencimiento || null,
      condicion_aptitud: item?.condicionAptitud || "",
      clinica: item?.clinica || "",
      controles: item?.controles || "",
      recomendaciones: item?.recomendaciones || "",
      user: item?.user,
      action: item.action,
      id: item.id,
    }));

    for (const item of format) {
      const { action, id, ...rest } = item;

      if (action === "disable") {
        const trabajador = await models.Trabajador.update(
          {
            habilitado: false,
          },
          { where: { id: id }, transaction: t  }
        );

        // Desvincular al trabajador de su empresa actual (si existe)
        const empresaActual = await models.EmpresaTrabajador.findOne({
          where: { trabajadorId: id, empresaId: item.empresaId },
        });

        if (empresaActual) {
          await empresaActual.destroy({ transaction: t });
        }

        // Vincular al trabajador a la nueva empresa
        await models.EmpresaTrabajador.create(
          { trabajadorId: trabajador.id, empresaId: 52 },
          { transaction: t }
        );

      }

      else if (action === "update") {
        const trabajador = await service.findByDni(item.dni);

        if (trabajador) {
          await trabajador.update(
            {
              apellidoPaterno: item.apellidoPaterno,
              apellidoMaterno: item.apellidoMaterno,
              nombres: item.nombres,
              email: item.email,
              celular: item.celular,
              genero: item.genero,
              edad: item.edad,
              fechadenac: item.fechadenac,
              areadetrabajo: item.areadetrabajo,
              cargo: item.cargo,
            },
            { transaction: t }
          );

          const empresasActuales = await trabajador.getEmpresas();
    
          // Verificar si hay relación entre las empresas
          const empresaRelacionada = await models.EmpresaRelaciones.findOne({
            where: {
              [Op.or]: [
                { 
                  empresaId: empresasActuales[0]?.id, 
                  relacionadaConEmpresaId: item.empresaId 
                },
                { 
                  empresaId: item.empresaId, 
                  relacionadaConEmpresaId: empresasActuales[0]?.id 
                }
              ]
            },
            transaction: t
          });
          // Asegurar relación con la empresa
          if (empresaRelacionada) {
            // Si hay relación, agregar la nueva empresa manteniendo la actual
            await trabajador.addEmpresas(item.empresaId, { transaction: t });
          } else {
            // Si no hay relación, reemplazar todas las empresas con la nueva
            await trabajador.setEmpresas([item.empresaId], { transaction: t });
          }
      

          responses.push({ message: `Trabajador ${item.dni} actualizado` });

          const emo = await serviceEmo.findByTrabajadorId(item.dni);
          if (!emo) {
            await models.Emo.create(
              {
                fecha_examen: item.fecha_examen,
                fecha_vencimiento: item.fecha_vencimiento,
                condicion_aptitud: item.condicion_aptitud,
                clinica: item.clinica,
                controles: item.controles,
                recomendaciones: item.recomendaciones,
                trabajadorId: item.dni,
              },
              { transaction: t }
            );
          } else {
            await emo.update(
              {
                fecha_examen: item.fecha_examen,
                fecha_vencimiento: item.fecha_vencimiento,
                condicion_aptitud: item.condicion_aptitud,
                clinica: item.clinica,
                controles: item.controles,
                recomendaciones: item.recomendaciones,
              },
              { transaction: t }
            );
          }
        }
      }

      else if (action === "create") {
        const [trabajador, created] = await models.Trabajador.findOrCreate({
          where: { dni: item.dni },
          defaults: {
            ...item,
            user: {
              ...item.user,
              contraseña: await bcrypt.hash(item.contraseña.toString(), 10),
              rol: "Trabajador",
            },
          },
          include: ["user"],
          transaction: t,
        });


        if (!created) {
          await trabajador.setEmpresas([item.empresaId], { transaction: t });
          responses.push({ message: `Trabajador ${item.dni} transferido a empresa ${item.empresaId}` });
        } else {
          responses.push({ message: `Trabajador ${item.dni} creado` });
        }

        await models.Emo.create(
          {
            fecha_examen: item.fecha_examen,
            fecha_vencimiento: item.fecha_vencimiento,
            condicion_aptitud: item.condicion_aptitud,
            clinica: item.clinica,
            controles: item.controles,
            recomendaciones: item.recomendaciones,
            trabajadorId: trabajador.dni,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    res.status(201).json(responses);
  } catch (error) {
    await t.rollback();
    console.error(error);
    next(error);
  }
});


/**
 * @swagger
 * /api/v1/trabajadores/cargaexcel/{empresaId}:
 *   post:
 *     summary: Carga un archivo de Excel con trabajadores para una empresa
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         description: ID de la empresa a la que se agregarán los trabajadores
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Se cargaron los trabajadores correctamente
 *       400:
 *         description: El archivo no es de formato Excel o no tiene datos
 *       500:
 *         description: Error en el servidor
 */

router.post(
  "/cargaexcel/:empresaId",
  upload.single("file"),
  async (req, res, next) => {
    const id = req.params.empresaId;
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 2 });

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

/**
 * @swagger
 * /api/v1/trabajadores/{id}:
 *   patch:
 *     summary: Actualiza un trabajador existente.
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del trabajador a actualizar.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Datos del trabajador a actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 description: Nombres del trabajador.
 *               apellidoPaterno:
 *                 type: string
 *                 description: Apellido paterno del trabajador.
 *               apellidoMaterno:
 *                 type: string
 *                 description: Apellido materno del trabajador.
 *               dni:
 *                 type: string
 *                 description: DNI del trabajador.
 *               genero:
 *                 type: string
 *                 description: Género del trabajador.
 *               edad:
 *                 type: integer
 *                 description: Edad del trabajador.
 *               areadetrabajo:
 *                 type: string
 *                 description: Área de trabajo del trabajador.
 *               cargo:
 *                 type: string
 *                 description: Cargo del trabajador.
 *               habilitado:
 *                 type: boolean
 *                 description: Actualiza para dar examen el trabajador.
 *               fechadenac:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del trabajador.
 *               user:
 *                 type: object
 *                 description: Datos de acceso del trabajador.
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Nombre de usuario.
 *                   contraseña:
 *                     type: string
 *                     description: Contraseña del usuario.
 *               empresaId:
 *                 type: integer
 *                 description: ID de la empresa a la que pertenece el trabajador.
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Trabajador actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trabajador'
 *       400:
 *         description: Error de validación en los datos enviados.
 *       404:
 *         description: No se encontró un trabajador con el ID especificado.
 *       500:
 *         description: Error interno del servidor.
 */

router.patch(
  "/:id",
  validatorHandler(getTrabajadorSchema, "params"),
  validatorHandler(updateTrabajadorSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const trabajador = await service.update(id, body);
      res.json(trabajador);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/**
 * @swagger
 * /api/v1/trabajadores/{id}:
 *   delete:
 *     summary: Elimina un trabajador con el usuario existente por su ID.
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del trabajador a eliminar.
 *     responses:
 *       200:
 *         description: El trabajador ha sido eliminada exitosamente.
 *       404:
 *         description: No se encontró el trabajador.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete(
  "/:id",
  validatorHandler(getTrabajadorSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
