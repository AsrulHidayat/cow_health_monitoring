const express = require("express");
const cors = require("cors");
require("dotenv").config();

const temperatureRoutes = require("./routes/temperatureRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware logging harus di atas route
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] Incoming request: ${req.method} ${req.url}`
  );
  next();
});

// Routes
app.use("/api/temperature", temperatureRoutes);

// Error handler global (supaya 500 kelihatan jelas)
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
