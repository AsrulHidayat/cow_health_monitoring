import express from "express";
import { 
  getCows, 
  addCow, 
  getCowById, 
  deleteCow,
  getAllCowsPublic,
  getDashboardStats,
  getNotifications,
  updateCheckupStatus,
  checkAndResetExpiredCheckups
} from "../controllers/cowController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// 🔹 Public route untuk dropdown (tanpa auth untuk IoT device)
router.get("/public", checkAndResetExpiredCheckups, getAllCowsPublic);

// 🔹 Dashboard stats
router.get("/dashboard/stats", verifyToken, checkAndResetExpiredCheckups, getDashboardStats);

// 🔹 Dashboard notifications
router.get("/dashboard/notifications", verifyToken, checkAndResetExpiredCheckups, getNotifications);

// 🔹 Ambil semua sapi milik user yang login
router.get("/", verifyToken, checkAndResetExpiredCheckups, getCows);

// 🔹 Tambah sapi baru
router.post("/", verifyToken, addCow);

// 🔹 Ambil detail sapi berdasarkan ID (hanya milik user login)
router.get("/:id", verifyToken, checkAndResetExpiredCheckups, getCowById);

// 🔹 Hapus sapi berdasarkan ID (hanya milik user login)
router.delete("/:id", verifyToken, deleteCow);

// 🔹 Perbarui status checkup sapi
router.put("/:id/checkup-status", verifyToken, updateCheckupStatus);

export default router;