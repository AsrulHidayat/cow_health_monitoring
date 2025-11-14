// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';

// --- PERBAIKAN ---
// Hapus 'axios'
// Impor fungsi-fungsi dari service Anda
import {
  getAllUserNotifications,
  markNotificationAsRead,
  deleteNotificationById
} from '../../services/notificationService'; 

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

      // --- PERBAIKAN: Gunakan Service ---
      // Panggil fungsi service, tidak perlu token atau URL di sini
      const response = await getAllUserNotifications();

      // Backend mengirim { total, limit, offset, data: [...] }
      // Akses response.data untuk mendapatkan array
      let allUserNotifications = Array.isArray(response.data) ? response.data : [];

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
      // Tampilkan array kosong agar UI menampilkan "Tidak ada notifikasi"
      setNotifications([]);

    } finally {
      setIsLoading(false);
    }
  }, [cowId]); // cowId tetap di dependency array untuk memicu filter ulang

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // --- PERBAIKAN: Gunakan Service ---
      // Update di backend
      await markNotificationAsRead(notificationId);

      // Update state lokal
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Update lokal saja jika API gagal (opsional, tapi baik untuk UX)
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
      const unreadIds = notifications
        .filter(n => !n.isRead)
        .map(n => n.id);

      // --- PERBAIKAN: Gunakan Service di dalam loop ---
      // Update di backend
      await Promise.all(
        // Panggil service markAsRead untuk setiap ID
        unreadIds.map(id => markNotificationAsRead(id))
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
  }, [notifications]); // Tetap gunakan 'notifications' sebagai dependency

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // --- PERBAIKAN: Gunakan Service ---
      // Hapus di backend
      await deleteNotificationById(notificationId);

      // Update state lokal
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Hapus lokal saja jika API gagal (opsional)
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