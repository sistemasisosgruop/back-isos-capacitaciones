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

router.post('/cargaexcel/:empresaId',
  upload.single('file') ,
  async(req,res,next)=>{
    const id = req.params.empresaId;
      const empresa = await serviceEmpresa.findOne(id);
      
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 3});
    const datosFiltrados = datos.filter(arr=>arr.length>0);    
    const headers = datosFiltrados[0];
    const rows = datosFiltrados.slice(1);
    const trabajadores = rows.map(row => {
      const trabajador = {};
      headers.forEach((header, index) => {
        trabajador[header] = row[index];
      });
      return trabajador;
    })

  try{
    //console.log(trabajadores);
    const trabajadoresbd = await service.createExcel(trabajadores, Number(id));
    //console.log(trabajadoresbd);
    res.status(201).json({ msg: "se ingresaron todos los datos" })
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