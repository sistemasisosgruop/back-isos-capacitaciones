const express=require('express');
const passport=require('passport');
const router=express.Router();
const jwt = require('jsonwebtoken');

const {config} = require('./../config/config');
const {models} = require('../libs/sequelize');


/**
 * @swagger
 * api/v1/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [LOGIN]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               contraseña:
 *                 type: string
 *             required:
 *               - username
 *               - contraseña
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               anyOf:
 *                 - $ref: '#/components/schemas/LoginValidoWorker'
 *                 - $ref: '#/components/schemas/LoginValidoAdmin'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *     security: []
 */

router.post('/login',
    passport.authenticate('local',{session:false}),
    async(req,res,next)=>{
        try{
            const user = req.user;
            const jwtconfig = {
                expiresIn: '2d',
            }
            const payload = {
                sub: user.id,
                role: user.rol,
            }
            const token = jwt.sign(payload, config.jwtSecret, jwtconfig);

            if (user.rol==="Trabajador") {
                const worker = await models.Trabajador.findOne({where: {userId : user.id}})
                res.json({
                    user,
                    token,
                    worker
                });
            }else if(user.rol==="Administrador"){
                const admin = await models.Administrador.findOne({where: {userId : user.id}})
                
                res.json({
                    user,
                    token,
                    admin
                });
            }
        }catch(error){
            next(error);
        }
    }
);

module.exports=router;