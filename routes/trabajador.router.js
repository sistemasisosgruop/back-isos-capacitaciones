const express = require('express');

const TrabajadorService = require('./../services/trabajador.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateTrabajadorSchema, createTrabajadorSchema, getTrabajadorSchema} = require('./../schemas/trabajadores.schema');

const router = express.Router();
const service = new TrabajadorService();

router.get('/',async (req, res, next)=>{
  try {
    const Trabajadores = await service.find();
    res.json(Trabajadores);
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

router.post('/',
  validatorHandler(createTrabajadorSchema, 'body'),
  async (req, res,next) => {
    try {
      const body = req.body;
      const nuevotrabajador = await service.create(body);
      res.status(201).json(nuevotrabajador);
    } catch (error) {
      next(error);
    }
  }
);

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