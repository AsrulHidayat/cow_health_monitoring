
import Notification from "../models/notificationModel.js";
import Cow from "../models/cowModel.js";
import { Op } from "sequelize";

// ========================================
// GET SEMUA NOTIFIKASI USER
// ========================================
export const getAllUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId: user_id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: Cow,
        attributes: ['tag']
      }]
    });

    res.json({
      total: count,
      limit,
      offset,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================================
// GET NOTIFIKASI PER SAPI (deprecated, use filter on frontend)
// ========================================
export const getNotificationsByCow = async (req, res) => {
    res.status(404).json({ message: "This endpoint is deprecated. Please use /api/notifications/user and filter by cow on the frontend." });
};


// ========================================
// GET UNREAD COUNT
// ========================================
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;

    const count = await Notification.count({
      where: { 
        userId: user_id,
        isRead: false 
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================================
// TANDAI SUDAH DIBACA
// ========================================
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========================================
// HAPUS NOTIFIKASI
// ========================================
export const deleteNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await Notification.destroy({
            where: { id, userId }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
