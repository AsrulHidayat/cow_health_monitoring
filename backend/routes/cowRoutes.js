import express from "express";
import { 
  getCows, 
  addCow, 
  getCowById, 
  deleteCow 
} from "../controllers/cowController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Ambil semua sapi milik user yang login
router.get("/", verifyToken, getCows);

// 🔹 Tambah sapi baru
router.post("/", verifyToken, addCow);

// 🔹 Ambil detail sapi berdasarkan ID (hanya milik user login)
router.get("/:id", verifyToken, getCowById);

// 🔹 Hapus sapi berdasarkan ID (hanya milik user login)
router.delete("/:id", verifyToken, deleteCow);

export default router;
