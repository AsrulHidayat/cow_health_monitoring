import express from "express";
import { 
  getCows, 
  addCow, 
  getCowById, 
  deleteCow,
  getAllCowsPublic,
  getDashboardStats,
  getNotifications
} from "../controllers/cowController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { updateCheckupStatus } from "../controllers/cowController.js";

const router = express.Router();

// 🔹 Public route untuk dropdown (tanpa auth untuk IoT device)
router.get("/public", getAllCowsPublic);

// 🔹 Dashboard stats
router.get("/dashboard/stats", verifyToken, getDashboardStats);

// 🔹 Dashboard notifications
router.get("/dashboard/notifications", verifyToken, getNotifications);

// 🔹 Ambil semua sapi milik user yang login
router.get("/", verifyToken, getCows);

// 🔹 Tambah sapi baru
router.post("/", verifyToken, addCow);

// 🔹 Ambil detail sapi berdasarkan ID (hanya milik user login)
router.get("/:id", verifyToken, getCowById);

// 🔹 Hapus sapi berdasarkan ID (hanya milik user login)
router.delete("/:id", verifyToken, deleteCow);

// 🔹 Perbarui status checkup sapi
router.put("/:id/checkup-status", verifyToken, updateCheckupStatus);

export default router;