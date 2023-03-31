const express = require('express');
const cors = require('cors');
const routerApi = require('./routes')
const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

app.use(cors())

require('./utils/auth');

app.get('/', (req, res)=>{
    res.send('Hola mi servidor en express');
});

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler)


app.listen(port, ()=>{
    console.log(`Mi puerto es: ${port}`);
})
