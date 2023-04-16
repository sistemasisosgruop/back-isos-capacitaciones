const express = require('express');
const path = require('path');
const EmpresasService = require('../services/empresas.service.js');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateEmpresaSchema, createEmpresaSchema, getEmpresaSchema, createEmpresaFilesSchema} = require('./../schemas/empresa.schema');

const router = express.Router();
const service = new EmpresasService();
const multer = require('multer');
const upload = multer({dest: 'images/'})

router.get('/',async (req, res, next)=>{
  try {
    const Empresas = await service.find();
    res.json(Empresas);
  } catch (error) {
    next(error);
  }
});

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
      next(error);
    }
  }
);

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

module.exports = router;