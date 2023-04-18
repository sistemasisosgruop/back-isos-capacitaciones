const express = require('express');

const trabajadorRouter = require('./trabajador.router');
const authRouter = require('./auth.router');
const usuarioRouter = require('./usuario.router');
const administradorRouter = require('./administrador.router');
const empresasRouter = require('./empresas.router');
const capacitacionesRouter = require('./capacitaciones.router');
const examenRouter = require('./examen.router')

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/trabajadores', trabajadorRouter);//ruta /trabajadores
    router.use('/auth', authRouter);              //ruta /auth
    router.use('/usuarios', usuarioRouter);       //ruta /usuarios
    router.use('/administradores', administradorRouter); //ruta /administrador
    router.use('/empresas', empresasRouter);      //ruta /empresas
    router.use('/capacitaciones', capacitacionesRouter); //ruta /capacitaciones
    router.use('/examenes', examenRouter)
}

module.exports = routerApi;