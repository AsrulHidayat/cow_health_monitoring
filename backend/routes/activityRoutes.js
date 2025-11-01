// backend/routes/activityRoutes.js
import express from "express";
import {
  addactivity,
  getLatestactivity,
  getHistoryactivity,
  getSensorStatus,
  deleteAllactivity,
  getactivityStats,
} from "../controllers/activityController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// POST /api/activity -> Menyimpan data baru (dari Arduino)
router.post("/", addactivity);

// GET /api/activity/:cowId/latest -> Data terakhir
router.get("/:cowId/latest", getLatestactivity);

// GET /api/activity/:cowId/history -> Riwayat data dengan pagination
// Query params: limit, offset, startDate, endDate
router.get("/:cowId/history", getHistoryactivity);

// GET /api/activity/:cowId/stats -> Statistik data gerakan
// Query params: startDate, endDate (optional)
router.get("/:cowId/stats", getactivityStats);

// GET /api/activity/:cowId/status -> Status sensor online/offline
router.get("/:cowId/status", getSensorStatus);

// DELETE /api/activity/:cowId/all -> Hapus semua data gerakan untuk sapi tertentu
router.delete("/:cowId/all", verifyToken, deleteAllactivity);

export default router;