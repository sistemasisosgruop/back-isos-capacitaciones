const express = require('express');

const TrabajadorService = require('./../services/trabajador.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateTrabajadorSchema, createTrabajadorSchema, getTrabajadorSchema} = require('./../schemas/trabajadores.schema');
const xlsx = require('xlsx');
const multer = require('multer');
const router = express.Router();
const service = new TrabajadorService();
const upload = multer({dest: 'excel/'});
const EmpresasService = require('../services/empresas.service.js');
const serviceEmpresa = new EmpresasService();
const moment = require('moment');

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

router.get('/',async (req, res, next)=>{
  try {
    const Trabajadores = await service.find();
    res.json(Trabajadores);
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
router.get('/:id',
  validatorHandler(getTrabajadorSchema, 'params'),
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
router.post('/',
  validatorHandler(createTrabajadorSchema, 'body'),
  async (req, res,next) => {
    try {
      const body = req.body;
      
      const valdni = await service.findByDni(body.dni)
      if(valdni){
        res.status(400).json({
          message: `Ya existe un Dni igual`
        })
      }else{
        const nuevotrabajador = await service.create(body);
        res.status(201).json(nuevotrabajador?nuevotrabajador:{message:'ya existe el usuario'});
      }
      
    } catch (error) {
      next(error);
    }
  }
);

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

router.post('/cargaexcel/:empresaId',
  upload.single('file') ,
  async(req,res,next)=>{
    try{

    const id = req.params.empresaId;
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 4});
 
    const datosFiltrados = datos.filter(arr=>arr.length>0);    
    const headers = datosFiltrados[0];
    const rows = datosFiltrados.slice(1);
    const trabajadores = rows.map(row => {
      const trabajador = {};
      headers.forEach((header, index) => {
        if (header === "FECHA DE NACIMIENTO") {
          let fecha = null;
          if (typeof row[index] === "number") {
            const fechaNumerica = row[index];
            fecha = moment((fechaNumerica - (25567 + 1)) * 86400 * 1000);
          } else {
            fecha = moment(row[index], 'DD/MM/YYYY', true);
          }
          trabajador[header] = fecha.isValid() ? fecha.format('YYYY-MM-DD') : null;
        } else {
          trabajador[header] = row[index];
        }
      });
    
      // Validación adicional de la fecha
      if (!trabajador["FECHA DE NACIMIENTO"] || trabajador["FECHA DE NACIMIENTO"] === "Invalid date") {
        trabajador["FECHA DE NACIMIENTO"] = null;
      }

      return trabajador;
    })

    const empresa = await serviceEmpresa.findOne(id);
    
    if (!empresa) {
      res.json(empresa)
    }
    else{
      const trabajadoresbd = await service.createExcel(trabajadores, Number(id));
      
      if (trabajadoresbd) {
        res.status(201).json({message: 'creado correctamente'})
      } else {
        res.status(500).json({message: 'hubo un error'})
      }
    }
    
  }catch(error){
    console.log(error);
    next(error)
  }
})

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

router.patch('/:id',
  validatorHandler(getTrabajadorSchema, 'params'),
  validatorHandler(updateTrabajadorSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const trabajador = await service.update(id, body);
      res.json(trabajador);
    } catch (error) {
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
router.delete('/:id',
  validatorHandler(getTrabajadorSchema, 'params'),
  async (req,res, next)=>{
  try {
    const {id} = req.params;
    await service.delete(id);
    res.status(201).json({id});
  } catch (error) {
    next(error);
  }
  }
);

module.exports = router;