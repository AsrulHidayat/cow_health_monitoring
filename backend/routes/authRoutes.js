import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Rute untuk autentikasi pengguna
// POST /api/auth/register → daftar pengguna baru
router.post("/register", registerUser);

// POST /api/auth/login → masuk dan dapatkan token JWT
router.post("/login", loginUser);

export default router;
