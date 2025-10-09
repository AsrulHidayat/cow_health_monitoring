import express from "express";
import {
  addTemperature,
  getLatestTemperature,
  getHistoryTemperature,
  getAverageTemperature,
  getSensorStatus,
} from "../controllers/temperatureController.js";

const router = express.Router();

// POST /api/temperature -> Menyimpan data baru
router.post("/", addTemperature);

// GET /api/temperature/:cowId/latest -> Data terakhir
router.get("/:cowId/latest", getLatestTemperature);

// GET /api/temperature/:cowId/history -> Riwayat data
router.get("/:cowId/history", getHistoryTemperature);

// GET /api/temperature/:cowId/average -> Rata-rata data
router.get("/:cowId/average", getAverageTemperature);

// GET /api/temperature/:cowId/status -> Status sensor online/offline
router.get("/:cowId/status", getSensorStatus);

export default router;
