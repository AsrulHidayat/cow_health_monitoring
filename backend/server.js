import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import temperatureRoutes from "./routes/temperatureRoutes.js";
import cowRoutes from "./routes/cowRoutes.js"; // ✅ tambahkan ini

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
app.use("/api/cows", cowRoutes); // ✅ route sapi berbasis Sequelize

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Jalankan server setelah DB terhubung
const startServer = async () => {
  try {
    await checkConnection(); // ✅ menggunakan Sequelize.authenticate()
    app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Gagal koneksi ke database:", error);
    process.exit(1);
  }
};

startServer();
