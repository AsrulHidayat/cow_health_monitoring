const mysql = require("mysql2/promise");
require("dotenv").config(); // Panggil dotenv di sini untuk keamanan ekstra

// ===== LOG UNTUK DEBUGGING =====
console.log(`Membaca DB_PORT dari .env: ${process.env.DB_PORT}`);
// ===============================

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306, 
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "monitoring_sapi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connection successful.");
    connection.release();
  } catch (error) {
    console.error("🔥 Database connection failed:", error);
    throw error;
  }
};

module.exports = { pool, checkConnection };

