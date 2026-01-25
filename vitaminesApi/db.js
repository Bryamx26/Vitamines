const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.API_DATABASE_HOST ,
  user: process.env.API_USER ,
  password: process.env.API_PASSWORD ,
  database: process.env.API_DATABASE ,
});

module.exports = pool;
