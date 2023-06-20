const { Pool } = require('pg');

const { config } = require('./../config/config');

const options = {
  connectionString: config.dbUrl
};

if (config.isProd) {
  options.ssl =  {
    rejectUnauthorized: false
  };
}
//prueba
const pool = new Pool(options);

module.exports = pool;