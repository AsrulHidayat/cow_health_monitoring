require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');

const PORT = process.env.PORT || 5001;
const API_KEY = process.env.API_KEY || "";
const DB_FILE = process.env.DB_FILE || './data.db';

const app = express();
app.use(cors());
app.use(express.json());

// Setup SQLite
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error("❌ DB Error:", err.message);
  console.log('✅ Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS suhu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    nilai REAL,
    waktu DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
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
  res.send('🚀 IoT Backend is running!');
});

// POST /api/suhu  <-- ESP32 kirim JSON { device_id: "esp01", suhu: 30.5 }
app.post('/api/suhu', checkApiKey, (req, res) => {
  try {
    const { device_id = 'esp32', suhu } = req.body;
    if (suhu === undefined) {
      return res.status(400).json({ error: 'suhu required' });
    }

    console.log(`📩 Data diterima dari ${device_id}: ${suhu}°C`);

    const stmt = db.prepare("INSERT INTO suhu (device_id, nilai) VALUES (?, ?)");
    stmt.run(device_id, parseFloat(suhu), function (err) {
      if (err) return res.status(500).json({ error: 'db error' });

      const newRowId = this.lastID;
      // ambil row yang baru dimasukkan
      db.get("SELECT * FROM suhu WHERE id = ?", [newRowId], (err, row) => {
        if (!err && row) {
          // Emit realtime ke client
          io.emit('new-suhu', row);
        }
      });

      res.json({ status: 'ok', id: newRowId });
    });
    stmt.finalize();
  } catch (e) {
    console.error("❌ Server Error:", e);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/suhu?limit=50  (ambil riwayat terbaru)
app.get('/api/suhu', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
  db.all("SELECT * FROM suhu ORDER BY waktu DESC LIMIT ?", [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// ✅ Tambahan: GET semua data (hati-hati bisa besar)
app.get('/api/suhu/all', (req, res) => {
  db.all("SELECT * FROM suhu ORDER BY waktu DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
