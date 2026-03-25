const mysql = require('mysql2')
require('dotenv').config()

let pool

if (process.env.MYSQL_URL) {
  // Production — Render MySQL URL
  pool = mysql.createPool(process.env.MYSQL_URL)
} else {
  // Local — individual credentials
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  })
}

module.exports = pool.promise()