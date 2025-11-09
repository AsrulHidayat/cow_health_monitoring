import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db, { checkConnection } from "./config/db.js"; 
import authRoutes from "./routes/authRoutes.js";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import cowRoutes from "./routes/cowRoutes.js"; 
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging setiap request
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.url}`
  );
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "API is healthy" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/temperature", temperatureRoutes);
app.use("/api/cows", cowRoutes); 
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes); 

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Jalankan server setelah DB terhubung
const startServer = async () => {
  try {
    await checkConnection(); 
    console.log("✅ Koneksi database berhasil.");

    // Sinkronisasi model (buat tabel jika belum ada)
    await db.sync(); 
    console.log("✅ Model & tabel database tersinkronisasi.");
    
    // Jalankan server
    app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Gagal memulai server:", error);
    process.exit(1);
  }
};

startServer();