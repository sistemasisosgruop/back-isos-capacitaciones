const express = require('express');

const trabajadorRouter = require('./trabajador.router');
const authRouter = require('./auth.router');

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/trabajador', trabajadorRouter);
    router.use('/auth', authRouter);
}

module.exports = routerApi;