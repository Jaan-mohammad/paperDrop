// 1. Import mysql2
const mysql = require('mysql2')

// 2. Import dotenv to read .env file
require('dotenv').config()

// 3. Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT, 
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

// 4. Export the pool with promise support
module.exports = pool.promise()


