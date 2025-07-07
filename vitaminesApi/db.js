const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'mysql', // 👈 nom du service défini dans docker-compose
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'vitamines_db',
});

module.exports = pool;
