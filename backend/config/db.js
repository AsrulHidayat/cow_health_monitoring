const mysql = require("mysql2/promise");
require("dotenv").config(); // Pastikan dotenv dipanggil di file utama atau di sini

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "monitoring_sapi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fungsi tambahan untuk mengecek koneksi
const checkConnection = async () => {
  try {
    await pool.getConnection();
    console.log("✅ Database connection successful.");
  } catch (error) {
    console.error("🔥 Database connection failed:", error);
    // Hentikan aplikasi jika koneksi database gagal, karena aplikasi tidak akan berfungsi
    process.exit(1); 
  }
};

// Ekspor pool dan fungsi pengecekan
module.exports = { pool, checkConnection };