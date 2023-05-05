const express = require('express');
const cors = require('cors');
const routerApi = require('./routes')
const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');
const swaggerDoc = require('./swagger');
const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());
/*
const whitelist = ['http://localhost:5500', 'http://127.0.0.1:5500'];
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('no permitido'));
    }
  }
}
*/
app.use(cors())

require('./utils/auth');

app.get('/', (req, res)=>{
    res.send('VISITA LA RUTA api-docs and github');
});

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler)

swaggerDoc(app);

app.listen(port, ()=>{
    console.log(`Mi puerto es: ${port}`);
})
