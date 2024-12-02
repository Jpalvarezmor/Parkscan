// config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'parkscan.c1qmgm26qorg.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'Hakunamatata3',
  database: 'parkscan',
});

module.exports = db;
