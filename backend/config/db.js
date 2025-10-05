const mysql = require("mysql2/promise");
require("dotenv").config();

console.log(`Membaca DB_PORT dari .env: ${process.env.DB_PORT}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "monitoring_sapi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi database
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connection successful.");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
};

module.exports = { pool, checkConnection };
