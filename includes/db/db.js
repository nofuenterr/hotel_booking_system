const { Pool, types } = require('pg');
const {
  NODE_ENV,
  DATABASE_URL,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT
} = require('../config/mainConfig.js');

types.setTypeParser(1114, val => val);
types.setTypeParser(1184, val => val);

const connectionConfig = NODE_ENV === 'production'
  ? {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
    };

const pool = new Pool(connectionConfig);

module.exports = pool;