const { pool } = require("../config/db");

// Insert data suhu baru
exports.insert = async (cow_id, temperature) => {
  const [result] = await pool.query(
    "INSERT INTO temperature_data (cow_id, temperature) VALUES (?, ?)",
    [cow_id, temperature]
  );
  return result;
};

// Data terbaru untuk 1 sapi
exports.getLatest = async (cowId) => {
  const [[row]] = await pool.query(
    "SELECT * FROM temperature_data WHERE cow_id = ? ORDER BY created_at DESC LIMIT 1",
    [cowId]
  );
  return row;
};

// History data suhu
exports.getHistory = async (cowId, limit) => {
  const [rows] = await pool.query(
    "SELECT id, temperature, created_at FROM temperature_data WHERE cow_id = ? ORDER BY created_at DESC LIMIT ?",
    [cowId, limit]
  );
  return rows;
};

// Rata-rata, min, max dalam window waktu
exports.getAverage = async (cowId, minutes) => {
  const [rows] = await pool.query(
    `SELECT 
        AVG(temperature) as avg_temp,
        MIN(temperature) as min_temp,
        MAX(temperature) as max_temp
     FROM temperature_data
     WHERE cow_id = ? AND created_at >= (NOW() - INTERVAL ? MINUTE)`,
    [cowId, minutes]
  );
  return rows[0];
};

// Mendapatkan timestamp dari data terakhir untuk 1 sapi
exports.getLastUpdateTime = async (cowId) => {
  const [[row]] = await pool.query(
    "SELECT created_at FROM temperature_data WHERE cow_id = ? ORDER BY created_at DESC LIMIT 1",
    [cowId]
  );
  // Mengembalikan timestamp-nya saja, atau null jika tidak ada
  return row ? row.created_at : null; 
};