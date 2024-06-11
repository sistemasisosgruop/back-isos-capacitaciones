const express = require('express');

const CapacitadorService = require('../services/capacitador.service')
const validatorHandler = require('../middlewares/validator.handler');
const {updateCapacitadorSchema, createCapacitadorSchema, getCapacitadorSchema} = require('../schemas/capacitador.schema');

const router = express.Router();
const service = new CapacitadorService();

router.get('/',async (req, res, next)=>{
  try {
    const capacitador = await service.find();
    res.json(capacitador);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getCapacitadorSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const capacitador = await service.findOne(id);
      res.json(capacitador);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createCapacitadorSchema, 'body'),
  async (req, res,next) => {
    try {
      const body = req.body;
      const newcapacitador = await service.create(body);
      res.status(201).json(newcapacitador);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(getCapacitadorSchema, 'params'),
  validatorHandler(updateCapacitadorSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const capacitador = await service.update(id, body);
      res.json(capacitador);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getCapacitadorSchema, 'params'),
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