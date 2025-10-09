// rute API

import express from "express";
import { getCows, addCow, getCow } from "../controllers/cowController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ambil semua sapi milik user yang login
router.get("/", verifyToken, getCows);

// Tambah sapi baru
router.post("/", verifyToken, addCow);

// Ambil sapi berdasarkan user_id (opsional, bisa untuk admin)
router.get("/user/:user_id", verifyToken, getCow);

export default router;
