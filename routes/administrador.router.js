const express = require('express');

const AdministradorService = require('./../services/administrador.service')
const validatorHandler = require('./../middlewares/validator.handler');
const {updateAdministradorSchema, createAdministradorSchema, getAdministradorSchema} = require('./../schemas/administrador.schema');

const router = express.Router();
const service = new AdministradorService();

router.get('/',async (req, res, next)=>{
  try {
    const admins = await service.find();
    res.json(admins);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getAdministradorSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const admin = await service.findOne(id);
      res.json(admin);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createAdministradorSchema, 'body'),
  async (req, res,next) => {
    try {
      const body = req.body;
      const newadmin = await service.create(body);
      res.status(201).json(newadmin);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(getAdministradorSchema, 'params'),
  validatorHandler(updateAdministradorSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const admin = await service.update(id, body);
      res.json(admin);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getAdministradorSchema, 'params'),
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