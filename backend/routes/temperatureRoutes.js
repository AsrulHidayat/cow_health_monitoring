const express = require("express");
const router = express.Router();
const temperatureController = require("../controllers/temperatureController");

// Tambah data suhu dari ESP32
router.post("/", temperatureController.addTemperature);

// Ambil data terbaru
router.get("/latest/:cowId", temperatureController.getLatestTemperature);

// Ambil history suhu
router.get("/:cowId", temperatureController.getHistoryTemperature);

// Ambil rata-rata suhu
router.get("/average/:cowId", temperatureController.getAverageTemperature);

module.exports = router;
