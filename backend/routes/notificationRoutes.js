// backend/routes/notificationRoutes.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    getAllUserNotifications,
    getNotificationsByCow,
    markNotificationAsRead,
    deleteNotificationById,
    getUnreadCount
} from "../controllers/notificationController.js";

const router = express.Router();

// --------------------------------------------------------------
// Rute yang lebih spesifik harus diletakkan di atas
// --------------------------------------------------------------

// GET /api/notifications/user (Get semua notif untuk user login)
router.get("/user", verifyToken, getAllUserNotifications);

// GET /api/notifications/unread-count (Get jumlah belum dibaca)
router.get("/unread-count", verifyToken, getUnreadCount);

// GET /api/notifications?cowId=... (Get notif per sapi)
router.get("/", verifyToken, getNotificationsByCow);

// PATCH /api/notifications/:id/read (Tandai sudah dibaca)
router.patch("/:id/read", verifyToken, markNotificationAsRead);

// DELETE /api/notifications/:id (Hapus notifikasi)
router.delete("/:id", verifyToken, deleteNotificationById);

export default router;