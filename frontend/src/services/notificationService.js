import axios from "axios";
const API_URL = "http://localhost:5001/api/notifications";

// Helper: Ambil token dari localStorage
const getToken = () => localStorage.getItem("token");

// Helper: Buat auth header
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    console.warn("Token not found in localStorage. Request may fail.");
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * Ambil SEMUA notifikasi user dengan pagination
 * (GET /api/notifications/user)
 */
export const getAllUserNotifications = async ({ page = 1, limit = 10 }) => {
  try {
    const offset = (page - 1) * limit;
    const res = await axios.get(`${API_URL}/user`, {
      headers: getAuthHeaders(),
      params: { limit, offset }, // Kirim limit dan offset
    });
    return res.data; // Mengembalikan: { total, limit, offset, data: [...] }
  } catch (error) {
    console.error(
      "Error fetching all user notifications:",
      error.response?.data || error.message
    );
    throw error; // Lempar error agar ditangkap oleh hook
  }
};

/**
 * Ambil jumlah notifikasi belum dibaca
 * (GET /api/notifications/unread-count)
 */
export const getUnreadCount = async () => {
  try {
    const res = await axios.get(`${API_URL}/unread-count`, {
      headers: getAuthHeaders(),
    });
    return res.data; // Mengembalikan: { count: X }
  } catch (error) {
    console.error(
      "Error fetching unread count:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Tandai notifikasi sebagai sudah dibaca
 * (PATCH /api/notifications/:id/read)
 */
export const markNotificationAsRead = (notificationId) => {
  // Biarkan hook/komponen menangani try/catch
  return axios.patch(
    `${API_URL}/${notificationId}/read`,
    { isRead: true }, // Body
    { headers: getAuthHeaders() }
  );
};

/**
 * Hapus notifikasi berdasarkan ID
 * (DELETE /api/notifications/:id)
 */
export const deleteNotificationById = (notificationId) => {
  // Biarkan hook/komponen menangani try/catch
  return axios.delete(`${API_URL}/${notificationId}`, {
    headers: getAuthHeaders(),
  });
};

/**
 * Tandai SEMUA notifikasi sebagai sudah dibaca
 * (PATCH /api/notifications/mark-all-as-read)
 */
export const markAllAsRead = () => {
  return axios.patch(
    `${API_URL}/mark-all-as-read`,
    {}, // Body kosong
    { headers: getAuthHeaders() }
  );
};
