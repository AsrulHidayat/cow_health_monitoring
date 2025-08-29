require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mysql = require('mysql2');

const PORT = process.env.PORT || 5001;
const API_KEY = process.env.API_KEY || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "cow_health";

const app = express();
app.use(cors());
app.use(express.json());

// Setup MySQL
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database.");
});

// Buat tabel jika belum ada
db.query(`
  CREATE TABLE IF NOT EXISTS suhu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    nilai FLOAT,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, err => {
  if (err) console.error("❌ Error creating table:", err.message);
});

// HTTP server + Socket.IO
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', socket => {
  console.log('🔌 Client connected', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected', socket.id));
});

// Middleware API Key
function checkApiKey(req, res, next) {
  const key = req.header('X-API-KEY') || "";
  if (API_KEY && key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ✅ Test endpoint
app.get('/', (req, res) => {
  res.send('🚀 IoT Backend with MySQL is running!');
});

// POST /api/suhu  <-- ESP32 kirim JSON { device_id: "esp01", suhu: 30.5 }
app.post('/api/suhu', checkApiKey, (req, res) => {
  try {
    const { device_id = 'esp32', suhu } = req.body;
    if (suhu === undefined) {
      return res.status(400).json({ error: 'suhu required' });
    }

    console.log(`📩 Data diterima dari ${device_id}: ${suhu}°C`);

    const sql = "INSERT INTO suhu (device_id, nilai) VALUES (?, ?)";
    db.query(sql, [device_id, parseFloat(suhu)], (err, result) => {
      if (err) {
        console.error("❌ DB Insert error:", err.message);
        return res.status(500).json({ error: 'db error' });
      }

      const newRowId = result.insertId;
      db.query("SELECT * FROM suhu WHERE id = ?", [newRowId], (err, rows) => {
        if (!err && rows.length > 0) {
          io.emit('new-suhu', rows[0]);
        }
      });

      res.json({ status: 'ok', id: newRowId });
    });
  } catch (e) {
    console.error("❌ Server Error:", e);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/suhu?limit=50  (ambil riwayat terbaru)
app.get('/api/suhu', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
  db.query("SELECT * FROM suhu ORDER BY waktu DESC LIMIT ?", [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// ✅ Tambahan: GET semua data
app.get('/api/suhu/all', (req, res) => {
  db.query("SELECT * FROM suhu ORDER BY waktu DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
