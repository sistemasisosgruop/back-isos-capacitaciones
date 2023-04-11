const express = require('express');

const TrabajadorService = require('./../services/trabajador.service');
const validatorHandler = require('./../middlewares/validator.handler');
const {updateTrabajadorSchema, createTrabajadorSchema, getTrabajadorSchema} = require('./../schemas/trabajadores.schema');
const xlsx = require('xlsx')
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
      
      //const nuevotrabajador = await service.create(body);
      //res.status(201).json(nuevotrabajador);
      console.log(body.user.username);
      const valdni = await service.findByDni(body.dni)
      if(valdni){
        res.status(400).json({
          msg: `Ya existe un Dni igual`
        })
      }else{
        const nuevotrabajador = await service.create(body);
        res.status(201).json(nuevotrabajador);
      }
      
    } catch (error) {
      next(error);
    }
  }
);

router.post('/cargarexcel/:empresaId', async(req,res,next)=>{
  const archivoBase64 = req.body.archivoExcel;
  const archivoBuffer = Buffer.from(archivoBase64, 'base64');

  const workbook = xlsx.read(archivoBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 4, defval: '' });

/*
  const columnas = datos[0];
  const filas = datos.slice(1);
  const datosJSON = filas.map((fila) => {
    return fila.reduce((obj, valor, indice) => {
      obj[columnas[indice]] = valor;
      return obj;
    }, {});
  });*/

  try{
    const id = req.params.empresaId;
    console.log(archivoBuffer);
    //const trabajadores = await service.createExcel(datos, id);
    res.status(201)
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