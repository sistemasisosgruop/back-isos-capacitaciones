const express = require('express');

const trabajadorRouter = require('./trabajador.router');
const authRouter = require('./auth.router');
const usuarioRouter = require('./usuario.router');
const administradorRouter = require('./administrador.router');
function routerApi(app){
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/trabajadores', trabajadorRouter);//ruta /trabajadores
    router.use('/auth', authRouter);              //ruta /auth
    router.use('/usuarios', usuarioRouter);       //ruta /usuarios
    router.use('/administradores', administradorRouter); //ruta //administrador
}

module.exports = routerApi;