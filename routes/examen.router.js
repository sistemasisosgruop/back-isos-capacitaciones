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


module.exports = router