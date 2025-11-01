// backend/routes/movementRoutes.js
import express from "express";
import {
  addMovement,
  getLatestMovement,
  getHistoryMovement,
  getSensorStatus,
  deleteAllMovement,
} from "../controllers/movementController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// POST /api/movement -> Menyimpan data baru (dari Arduino)
router.post("/", addMovement);

// GET /api/movement/:cowId/latest -> Data terakhir
router.get("/:cowId/latest", getLatestMovement);

// GET /api/movement/:cowId/history -> Riwayat data dengan pagination
// Query params: limit, offset, startDate, endDate
router.get("/:cowId/history", getHistoryMovement);

// GET /api/movement/:cowId/status -> Status sensor online/offline
router.get("/:cowId/status", getSensorStatus);

// DELETE /api/movement/:cowId/all -> Hapus semua data gerakan untuk sapi tertentu
router.delete("/:cowId/all", verifyToken, deleteAllMovement);

export default router;