import express from "express";
import {
  addTemperature,
  getLatestTemperature,
  getHistoryTemperature,
  getAverageTemperature,
  getSensorStatus,
  getTemperatureByDateRange,
  getTemperatureStats,
} from "../controllers/temperatureController.js";
import { deleteAllTemperature } from "../controllers/temperatureController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/temperature -> Menyimpan data baru
router.post("/", addTemperature);

// GET /api/temperature/:cowId/latest -> Data terakhir
router.get("/:cowId/latest", getLatestTemperature);

// GET /api/temperature/:cowId/history -> Riwayat data dengan pagination
// Query params: limit, offset, startDate, endDate
router.get("/:cowId/history", getHistoryTemperature);

// GET /api/temperature/:cowId/range -> Data dalam range tanggal
// Query params: startDate (required), endDate (required)
router.get("/:cowId/range", getTemperatureByDateRange);

// GET /api/temperature/:cowId/average -> Rata-rata data
// Query params: limit, startDate, endDate
router.get("/:cowId/average", getAverageTemperature);

// GET /api/temperature/:cowId/stats -> Statistik data
// Query params: startDate, endDate
router.get("/:cowId/stats", getTemperatureStats);

// GET /api/temperature/:cowId/status -> Status sensor online/offline
router.get("/:cowId/status", getSensorStatus);

// DELETE /api/temperature/:cowId/all -> Hapus semua data suhu untuk sapi tertentu
router.delete("/:cowId/all", verifyToken, deleteAllTemperature);

export default router;