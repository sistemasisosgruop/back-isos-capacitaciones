const express = require('express');

const EmpresasService = require('../services/empresas.service.js');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateEmpresaSchema, createEmpresaSchema, getEmpresaSchema} = require('./../schemas/empresa.schema');

const router = express.Router();
const service = new EmpresasService();

router.get('/',async (req, res, next)=>{
  try {
    const Empresas = await service.find();
    res.json(Empresas);
  } catch (error) {
    next(error);
  }
});

/*
router.get('/:dni', async(req,res,next)=>{
  try {
    const {dni} = req.params;
    const trabajador = await service.findByDni(dni);
    res.json(trabajador);
  } catch (error) {
    next(error);
  }
})
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

router.post('/',
  validatorHandler(createEmpresaSchema, 'body'),
  async (req, res,next) => {
    try {
      const body = req.body;
      const nuevoEmpresa = await service.create(body);
      res.status(201).json(nuevoEmpresa);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(getEmpresaSchema, 'params'),
  validatorHandler(updateEmpresaSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const Empresa = await service.update(id, body);
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