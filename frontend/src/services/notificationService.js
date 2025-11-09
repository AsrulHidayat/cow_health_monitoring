// frontend/src/services/notificationService.js
import axios from "axios";

const API_URL = "http://localhost:5001/api";

/**
 * Helper untuk mengambil token dari localStorage
 */
const getToken = () => localStorage.getItem("token");

/**
 * Mengambil notifikasi untuk dashboard
 * (GET /api/cows/dashboard/notifications)
 */
export const getNotifications = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/cows/dashboard/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching notifications:", error.response?.data || error.message);
    return [];
  }
};