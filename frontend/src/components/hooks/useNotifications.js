// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook untuk mengelola notifikasi sapi
 * @param {string | null} cowId - ID sapi yang dipilih, atau null untuk notifikasi global
 * @returns {Object} - State dan functions untuk notifikasi
 */
// --- MODIFIKASI ---
// Beri nilai default null pada cowId
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

      // --- MODIFIKASI ---
      // Tentukan endpoint secara dinamis
      // Jika cowId ada, pakai endpoint LAMA (spesifik per sapi)
      // Jika cowId null, pakai endpoint BARU (global untuk user)
      const endpoint = cowId
        ? `http://localhost:5001/api/notifications?cowId=${cowId}`
        : `http://localhost:5001/api/notifications/user`; // <-- Ganti ini jika endpoint global Anda berbeda

      const response = await axios.get(
        endpoint, // <-- Gunakan endpoint dinamis
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);

      // --- MODIFIKASI ---
      // Hanya gunakan mock data jika kita BERADA di halaman DashboardPerSapi (ada cowId)
      if (cowId) {
        // Fallback ke mock data untuk development
        setNotifications(getMockNotifications(cowId));
      } else {
        // Jika gagal di Navbar (global), jangan tampilkan mock data,
        // biarkan array kosong.
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cowId]);

  // Mark notification as read
  // (Tidak perlu diubah, sudah bekerja berdasarkan notificationId)
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
  // (Tidak perlu diubah)
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
  // (Tidak perlu diubah)
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

// Mock data untuk development/testing
const getMockNotifications = (cowId) => {
  return [
    {
      id: 1,
      sapiId: cowId,
      sapiName: 'Sapi #4',
      type: 'urgent',
      parameters: ['suhu', 'detak jantung'],
      severity: 'Segera Tindaki',
      message: 'Suhu tubuh mencapai 40.5°C dan detak jantung 110 bpm (abnormal)',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false
    },
    {
      id: 2,
      sapiId: cowId,
      sapiName: 'Sapi #4',
      type: 'warning',
      parameters: ['gerakan'],
      severity: 'Harus Diperhatikan',
      message: 'Aktivitas gerakan menurun drastis dalam 2 jam terakhir',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      isRead: false
    },
    {
      id: 3,
      sapiId: cowId,
      sapiName: 'Sapi #4',
      type: 'urgent',
      parameters: ['suhu'],
      severity: 'Segera Tindaki',
      message: 'Suhu tubuh tidak stabil, variasi 38-41°C dalam 1 jam',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      isRead: true
    }
  ];
};