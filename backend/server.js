import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import mysql from "mysql2";

dotenv.config();

const PORT = process.env.PORT || 5001;
const API_KEY = process.env.API_KEY || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "cow_health";

const app = express();
app.use(cors());
app.use(express.json());

// MySQL pool
const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cek koneksi
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database.");
  connection.release();
});

// Buat tabel suhu
db.query(`
  CREATE TABLE IF NOT EXISTS suhu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    nilai FLOAT,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, err => { if(err) console.error(err.message); });

// HTTP server + Socket.IO
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', socket => {
  console.log('🔌 Client connected', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected', socket.id));
});

// Middleware API Key
function checkApiKey(req, res, next) {
  const key = req.header('X-API-KEY') || "";
  if (API_KEY && key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Test endpoint
app.get('/', (req, res) => res.send('🚀 IoT Backend running!'));

// POST suhu
app.post('/api/suhu', checkApiKey, (req, res) => {
  try {
    const { device_id = 'esp32', suhu } = req.body;
    if (suhu === undefined) return res.status(400).json({ error: 'suhu required' });

    const sql = "INSERT INTO suhu (device_id, nilai) VALUES (?, ?)";
    db.query(sql, [device_id, parseFloat(suhu)], (err, result) => {
      if(err) return res.status(500).json({ error: 'db error' });

      const newRowId = result.insertId;
      db.query("SELECT * FROM suhu WHERE id = ?", [newRowId], (err, rows) => {
        if(!err && rows.length>0) io.emit('new-suhu', rows[0]);
      });

      res.json({ status:'ok', id: newRowId });
    });
  } catch(e) { res.status(500).json({ error:'server error' }); }
});

// GET suhu terakhir
app.get('/api/suhu', (req,res)=>{
  const limit = Math.min(parseInt(req.query.limit)||50, 1000);
  db.query("SELECT * FROM suhu ORDER BY waktu DESC LIMIT ?", [limit], (err, rows)=>{
    if(err) return res.status(500).json({ error:'db error' });
    res.json(rows);
  });
});

// GET semua data
app.get('/api/suhu/all', (req,res)=>{
  db.query("SELECT * FROM suhu ORDER BY waktu DESC", (err, rows)=>{
    if(err) return res.status(500).json({ error:'db error' });
    res.json(rows);
  });
});

// GET rata-rata / agregasi
app.get('/api/suhu/avg/:period', (req,res)=>{
  const { period } = req.params;
  let sql = "";

  switch(period){
    case "minute":
      sql = `SELECT DATE_FORMAT(waktu, '%Y-%m-%dT%H:%i:00') AS periode, AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY periode ORDER BY periode DESC LIMIT 1000`;
      break;
    case "10minutes":
      sql = `SELECT DATE_FORMAT(DATE_ADD(DATE(waktu), INTERVAL HOUR(waktu) HOUR) 
              + INTERVAL FLOOR(MINUTE(waktu)/10)*10 MINUTE, '%Y-%m-%dT%H:%i:00') AS periode,
             AVG(nilai)+0 AS avg_suhu
             FROM suhu
             GROUP BY UNIX_TIMESTAMP(waktu) DIV 600
             ORDER BY periode DESC
             LIMIT 1000`;
      break;
    case "hour":
      sql = `SELECT DATE_FORMAT(waktu, '%Y-%m-%dT%H:00:00') AS periode, AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY periode ORDER BY periode DESC LIMIT 1000`;
      break;
    case "day":
      sql = `SELECT DATE_FORMAT(waktu, '%Y-%m-%dT00:00:00') AS periode, AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY periode ORDER BY periode DESC LIMIT 1000`;
      break;
    case "3days":
      sql = `SELECT DATE_FORMAT(DATE(waktu) - INTERVAL (DAYOFMONTH(waktu)-1) % 3 DAY, '%Y-%m-%dT00:00:00') AS periode,
             AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY periode ORDER BY periode DESC LIMIT 1000`;
      break;
    case "week":
      sql = `SELECT STR_TO_DATE(CONCAT(YEARWEEK(waktu,1),' Monday'), '%X%V %W') AS periode,
             AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY YEARWEEK(waktu,1) ORDER BY periode DESC LIMIT 100`;
      break;
    case "month":
      sql = `SELECT DATE_FORMAT(waktu, '%Y-%m-01T00:00:00') AS periode, AVG(nilai)+0 AS avg_suhu
             FROM suhu GROUP BY DATE_FORMAT(waktu,'%Y-%m') ORDER BY periode DESC LIMIT 100`;
      break;
    default:
      return res.status(400).json({ error:'invalid period' });
  }

  db.query(sql, (err, rows)=>{
    if(err) return res.status(500).json({ error:'db error' });
    if(!Array.isArray(rows)) rows=[];
    res.json(rows);
  });
});

// Start server
server.listen(PORT, ()=>console.log(`🚀 Server running at http://localhost:${PORT}`));
