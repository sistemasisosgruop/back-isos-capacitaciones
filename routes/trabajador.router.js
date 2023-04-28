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
        //trabajador[header] = row[index];
          if (header === "FECHA DE NACIMIENTO") {
            // Convierte el número de serie de fecha de Excel en una fecha legible
            const fechaNumerica = row[index];
            
            const fecha = moment((fechaNumerica-(25567+1))*86400*1000);
            trabajador[header] = fecha.format('DD/MM/YYYY');
          } else {
            trabajador[header] = row[index];
          }
      });
      return trabajador;
    })
    
  try{
    const empresa = await serviceEmpresa.findOne(id);
    
    if (!empresa) {
      res.json(empresa)
    }
    else{
      const trabajadoresbd = await service.createExcel(trabajadores, Number(id));
      if (trabajadoresbd) {
        res.status(201).json({message: 'ccreado correctamente'})
      } else {
        res.status(500).json({message: 'hubo un error'})
      }
    }
    
  }catch(error){
    next(error);
  }
})

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