// frontend/src/services/dashboardService.js
import axios from "axios";

const API_URL = "http://localhost:5001/api";

/**
 * Helper untuk mengambil token dari localStorage
 */
const getToken = () => localStorage.getItem("token");

/**
 * Mengambil statistik untuk dashboard utama
 * (GET /api/cows/dashboard/stats)
 */
export const getDashboardStats = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/cows/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.response?.data || error.message);
    return null;
  }
};