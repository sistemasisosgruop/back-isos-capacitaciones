const express = require('express');
const path = require('path');
const EmpresasService = require('../services/empresas.service.js');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateEmpresaSchema, createEmpresaSchema, getEmpresaSchema, createEmpresaFilesSchema} = require('./../schemas/empresa.schema');

const router = express.Router();
const service = new EmpresasService();
const multer = require('multer');
const upload = multer({dest: 'images/'})

/**
 * @swagger
 * components:
 *   schemas:
 *     Empresa:
 *       type: object
 *       required:
 *         - nombreEmpresa
 *         - direccion
 *         - nombreGerente
 *         - numeroContacto
 *         - RUC
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único de la empresa
 *         nombreEmpresa:
 *           type: string
 *           description: Nombre de la empresa
 *         direccion:
 *           type: string
 *           description: Dirección de la empresa
 *         nombreGerente:
 *           type: string
 *           description: Nombre del gerente de la empresa
 *         numeroContacto:
 *           type: string
 *           description: Número de contacto de la empresa
 *         imagenLogo:
 *           type: string
 *           description: Nombre del archivo de imagen del logo de la empresa
 *         imagenCertificado:
 *           type: string
 *           description: Nombre del archivo de imagen del certificado de la empresa
 *         RUC:
 *           type: string
 *           description: RUC de la empresa
 *
 * /api/v1/empresas:
 *   get:
 *     summary: Obtiene todas las empresas registradas
 *     tags: [Empresas]
 *     responses:
 *       200:
 *         description: Lista de todas las empresas registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 
 */

router.get('/',async (req, res, next)=>{
  try {
    const Empresas = await service.find();
    res.json(Empresas);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/empresas/{id}:
 *   get:
 *     summary: Obtiene una empresa por su ID.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la empresa a obtener.
 *     responses:
 *       200:
 *         description: La empresa ha sido encontrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: No se encontró la empresa especificada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id',
  validatorHandler(getEmpresaSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const Empresa = await service.findOne(id);
      res.json(Empresa);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/capacitador/:id', async(req, res, next)=>{
  try {
      const {id} = req.params;
      const empresa = await service.findCapacitadorOne(id);
      res.json(empresa)
  } catch (error) {
      next(error);
  }
})

/**
 * @swagger
 * /api/v1/empresas:
 *   post:
 *     summary: Crea una nueva empresa.
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombreEmpresa:
 *                 type: string
 *                 description: Nombre de la empresa
 *               direccion:
 *                 type: string
 *                 description: Dirección de la empresa
 *               nombreGerente:
 *                 type: string
 *                 description: Nombre del gerente de la empresa
 *               numeroContacto:
 *                 type: string
 *                 description: Número de contacto de la empresa
 *               imagenLogo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del logo de la empresa
 *               imagenCertificado:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del certificado de la empresa
 *               RUC:
 *                 type: string
 *                 description: RUC de la empresa (11 dígitos)
 *     responses:
 *       201:
 *         description: La empresa ha sido creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmpresaInput'
 *       400:
 *         description: Error de validación de datos
 *       500:
 *         description: Error interno del servidor
 */

router.post('/',
  //validatorHandler(createEmpresaSchema, 'body'),
  upload.fields([{name: 'imagenLogo', maxCount: 1},{name:'imagenCertificado', maxCount:1}]),
  //validatorHandler(createEmpresaFilesSchema, 'files'),
  async (req, res,next) => {
    try {
      const body = req.body;
      const files = req.files;
      const nuevoEmpresa = await service.create({...body, ...files});
      res.status(201).json(nuevoEmpresa);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/empresas/{id}/logo:
 *   get:
 *     summary: Obtiene el logo de una empresa por su ID.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la empresa a buscar.
 *     responses:
 *       200:
 *         description: Imagen del logo de la empresa.
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No se encontró la imagen del logo de la empresa.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/logo', async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresa = await service.findOne(id);
    if (empresa.imagenLogo) {
      const filePath = path.join(__dirname, '..', 'images', empresa.imagenLogo);
      res.sendFile(filePath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/v1/empresas/{id}/certificado:
 *   get:
 *     summary: Obtiene el certificado de una empresa por su ID.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la empresa a buscar.
 *     responses:
 *       200:
 *         description: Imagen del certificado de la empresa.
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No se encontró la imagen del logo de la empresa.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id/certificado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresa = await service.findOne(id);
    if (empresa.imagenCertificado) {
      const filePath = path.join(__dirname, '..', 'images', empresa.imagenCertificado);
      res.sendFile(filePath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (error) {
    next(error);
  }
});



/**
 * @swagger
 * /api/v1/empresas/{id}:
 *   patch:
 *     summary: Actualiza una empresa existente por su ID.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la empresa a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombreEmpresa:
 *                 type: string
 *                 description: Nombre de la empresa
 *               direccion:
 *                 type: string
 *                 description: Dirección de la empresa
 *               nombreGerente:
 *                 type: string
 *                 description: Nombre del gerente de la empresa
 *               numeroContacto:
 *                 type: string
 *                 description: Número de contacto de la empresa
 *               imagenLogo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del logo de la empresa
 *               imagenCertificado:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del certificado de la empresa
 *               RUC:
 *                 type: string
 *                 description: RUC de la empresa (11 dígitos)
 *     responses:
 *       200:
 *         description: La empresa ha sido actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: Error de validación de datos.
 *       404:
 *         description: No se encontró la empresa especificada.
 *       500:
 *         description: Error interno del servidor.
 */

router.patch('/:id',
  validatorHandler(getEmpresaSchema, 'params'),
  //validatorHandler(updateEmpresaSchema, 'body'),
  upload.fields([{name: 'imagenLogo', maxCount: 1},{name:'imagenCertificado', maxCount:1}]),
  
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const files = req.files;
      const Empresa = await service.update(id, {...body, ...files});
      res.json(Empresa);
    } catch (error) {
      next(error);
    }
  }
);


/**
 * @swagger
 * /api/v1/empresas/{id}:
 *   delete:
 *     summary: Elimina una empresa existente por su ID.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la empresa a eliminar, No borra la empresa sí tiene trabajadores.
 *     responses:
 *       200:
 *         description: La empresa ha sido eliminada exitosamente.
 *       404:
 *         description: No se encontró la empresa especificada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id',
  validatorHandler(getEmpresaSchema, 'params'),
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



router.post("/relaciones", async (req, res, next) => {
  try {
    const empresaIds  = req.body;
    const empresasRelacionadas = await service.getEmpresasRelacionadas(empresaIds);
    res.json(empresasRelacionadas);
  } catch (error) {
    next(error);
  }
});

module.exports = router;