const express = require('express');

const trabajadorRouter = require('./trabajador.router');
const authRouter = require('./auth.router');

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/trabajadores', trabajadorRouter);//ruta /trabajadores
    router.use('/auth', authRouter);              //ruta /auth 
}

module.exports = routerApi;