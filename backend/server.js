const { checkConnection } = require("./config/db"); // Pastikan path ini benar

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require('./routes/authRoutes'); 
const temperatureRoutes = require("./routes/temperatureRoutes");


const app = express();
app.use(cors());
app.use(express.json());


// Middleware logging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] Incoming request: ${req.method} ${req.url}`
  );
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "API is healthy" });
});

// Routes
app.use('/api/auth', authRoutes); 
app.use("/api/temperature", temperatureRoutes);



// Error handler global (supaya 500 kelihatan jelas)
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5001;

// Fungsi untuk memulai server setelah koneksi DB berhasil
const startServer = async () => {
  try {
    await checkConnection(); // Cek koneksi DB dulu
    app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Could not start server, failed to connect to database.", error);
    process.exit(1); // Hentikan aplikasi jika tidak bisa konek ke DB
  }
};

// Jalankan server
startServer();
