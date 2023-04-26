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
        console.log(pregunta);
        if(!pregunta){
            res.status(404).json({message:"Pregunta no encontrada"})
        }else{
            console.log('llegamos');
            console.log(pregunta);
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



module.exports = router