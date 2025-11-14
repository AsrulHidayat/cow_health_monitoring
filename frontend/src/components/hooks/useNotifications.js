// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook untuk mengelola notifikasi sapi
 * @param {string | null} cowId - ID sapi yang dipilih, atau null untuk notifikasi global
 * @returns {Object} - State dan functions untuk notifikasi
 */
export const useNotifications = (cowId = null) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifikasi dari API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // --- PERBAIKAN 1 ---
      // SELALU gunakan endpoint global /user. Endpoint ?cowId=... sudah deprecated.
      const endpoint = `http://localhost:5001/api/notifications/user`;

      const response = await axios.get(
        endpoint,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // --- PERBAIKAN 2 ---
      // Backend mengirim { total, limit, offset, data: [...] }
      // Jadi, kita perlu mengakses response.data.data untuk mendapatkan array
      let allUserNotifications = Array.isArray(response.data.data) ? response.data.data : [];

      // --- PERBAIKAN 3 ---
      // Terapkan filter di sisi klien (frontend) jika cowId diberikan
      if (cowId) {
        allUserNotifications = allUserNotifications.filter(
          (notif) => notif.sapiId == cowId
        );
      }
      
      setNotifications(allUserNotifications);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);

      // --- PERBAIKAN 4 ---
      // Jangan pernah fallback ke mock data saat terjadi error.
      // Tampilkan array kosong agar UI menampilkan "Tidak ada notifikasi"
      setNotifications([]);

    } finally {
      setIsLoading(false);
    }
  }, [cowId]); // cowId tetap di dependency array untuk memicu filter ulang saat berubah

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');

      // Update di backend
      await axios.patch(
        `http://localhost:5001/api/notifications/${notificationId}/read`,
        { isRead: true },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state lokal
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Update lokal saja jika API gagal
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadIds = notifications
        .filter(n => !n.isRead)
        .map(n => n.id);

      // Update di backend
      await Promise.all(
        unreadIds.map(id =>
          axios.patch(
            `http://localhost:5001/api/notifications/${id}/read`,
            { isRead: true },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
        )
      );

      // Update state lokal
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Update lokal saja jika API gagal
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');

      // Hapus di backend
      await axios.delete(
        `http://localhost:5001/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state lokal
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Hapus lokal saja jika API gagal
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    }
  }, []);

  // Auto-refresh notifications setiap 30 detik
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Hitung unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};