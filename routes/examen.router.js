const { Router } = require('express');

const {models} = require('../libs/sequelize');

const router = Router();

router.get('/', async (req,res, next)=>{
    try {
        const examenes = await models.Examen.findAll({
            include: ['capacitacion', 'pregunta']
        });
        const associations = await models.Examen.associations;
        const methods = await models.Examen.sequelize;
        console.log(methods);
        console.log(associations);
        res.json(examenes);
    } catch (error) {
        next(error)
    }
})


module.exports = router