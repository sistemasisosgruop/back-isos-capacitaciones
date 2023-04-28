const { Router } = require('express');

const {models} = require('../libs/sequelize');

const router = Router();

router.get('/', async (req,res, next)=>{
    try {
        const examenes = await models.Examen.findAll({
            include: ['capacitacion', 'pregunta']
        });
        res.json(examenes);
    } catch (error) {
        next(error)
    }
})

router.get('/preguntas', async (req,res, next)=>{
    try {
        const preguntas = await models.Pregunta.findAll()
        res.json(preguntas);
    } catch (error) {
        next(error)
    }
})

router.patch('/preguntas/:id', async(req,res)=>{
    try {
        const {id } = req.params;
        const body = req.body;
        const pregunta = await models.Pregunta.findByPk(id);
        if(!pregunta){
            res.status(404).json({message:"Pregunta no encontrada"})
        }else{
            const respuesta = await pregunta.update(body);
            res.status(200).json(respuesta)
        }
    } catch (error) {
        res.status(500).json({message: 'Pregunta no fue actualizada'})
    }
})

router.get('/:id', async(req,res, next)=>{
    try {
        const id = req.params.id;
        const examenes = await models.Examen.findByPk(id, {
            include: ['capacitacion', 'pregunta']
        });
        if(!examenes){
            res.status(404).json({message: 'No existe el examen'})
        }
        res.json(examenes)
    } catch (error) {
        next(error)        
    }
})

router.patch('/:id', async(req,res, next)=>{
    try {
        const {id} = req.params;
        const body = req.body;
        const examen = await models.Examen.findByPk(id);
        if(!examen){
            res.status(404).json({message: 'No existe el examen'})
        }else{
            const exameneditado = await examen.update(body);
            res.status(200).json(exameneditado)
        }
    } catch (error) {
        res.status(500).json({message:'Examen no editado'})        
    }
})



module.exports = router