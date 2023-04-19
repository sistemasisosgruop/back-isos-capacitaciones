const {Router} = require('express');

const {models} = require('../libs/sequelize')
const router = Router();

router.get('/', async(req, res, next)=>{
    try {
        const tests = await models.Test.findAll();
        
        res.json(tests)
    } catch (error) {
        next(error);
    }
})

router.get('/:id', async (req,res, next)=>{
    try {
        const {id} = req.params;
        const tes = await models.Test.findByPk(id);
        res.json(tes)
    } catch (error) {
        next(error)        
    }
})

router.post('/', async (req,res, next)=>{
    try {
    } catch (error) {
        
    }
})

module.exports = router