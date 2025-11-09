// backend/routes/activityRoutes.js
import express from "express";
import {
  createActivity,
  getLatestActivity,
  getHistoryActivity,
  getSensorStatus,
  deleteAllActivity,
  getActivityStats,
} from "../controllers/activityController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// POST /api/activity -> Menyimpan data baru (dari Arduino)
router.post("/", createActivity);

// GET /api/activity/:cowId/latest -> Data terakhir
router.get("/:cowId/latest", getLatestActivity);

// GET /api/activity/:cowId/history -> Riwayat data dengan pagination
// Query params: limit, offset, startDate, endDate
router.get("/:cowId/history", getHistoryActivity);

// GET /api/activity/:cowId/stats -> Statistik data gerakan
// Query params: startDate, endDate (optional)
router.get("/:cowId/stats", getActivityStats);

// GET /api/activity/:cowId/status -> Status sensor online/offline
router.get("/:cowId/status", getSensorStatus);

// DELETE /api/activity/:cowId/all -> Hapus semua data gerakan untuk sapi tertentu
router.delete("/:cowId/all", verifyToken, deleteAllActivity);

export default router;