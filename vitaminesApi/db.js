const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',         // Mets ton mot de passe ici
  database: 'vitamines_db',
});

module.exports = pool;
