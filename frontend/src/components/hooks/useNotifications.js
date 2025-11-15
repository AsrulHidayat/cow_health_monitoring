// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAllUserNotifications,
  markNotificationAsRead,
  deleteNotificationById,
  markAllAsRead as markAllAsReadService // Impor service "Tandai Semua"
} from '../../services/notificationService'; // Sesuaikan path

// Tentukan berapa banyak notifikasi yang diambil per halaman
const NOTIFICATIONS_PER_PAGE = 10; 

export const useNotifications = (cowId = null) => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading untuk halaman pertama
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading untuk "load more"
  const [error, setError] = useState(null);

  // Fungsi internal untuk mengambil data
  const fetchData = useCallback(async (pageToFetch) => {
    // Tentukan state loading yang sesuai
    if (pageToFetch === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getAllUserNotifications({
        page: pageToFetch,
        limit: NOTIFICATIONS_PER_PAGE
      });

      let newNotifications = Array.isArray(response.data) ? response.data : [];

      // Filter sisi klien (HANYA jika cowId diberikan)
      if (cowId) {
        newNotifications = newNotifications.filter(
          (notif) => notif.sapiId == cowId
        );
      }

      // Gabungkan data lama dan baru (jika load more) atau set data baru (jika halaman 1)
      setNotifications(prev =>
        pageToFetch === 1 ? newNotifications : [...prev, ...newNotifications]
      );
      // Simpan total jumlah notifikasi dari API
      setTotal(response.total);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [cowId]); // Hanya bergantung pada cowId

  // Fungsi untuk me-reset dan mengambil data dari awal
  const refetch = useCallback(() => {
    setPage(1); // Set halaman kembali ke 1
    fetchData(1); // Panggil fetch manual untuk halaman 1
  }, [fetchData]);


  // --- PERBAIKAN INFINITE LOOP ---
  // useEffect ini sekarang HANYA akan berjalan saat 'fetchData' berubah
  // atau 'page' di-set ke 1 (saat refetch).
  useEffect(() => {
    // Hanya ambil data jika kita berada di halaman 1 (pemuatan awal)
    if (page === 1) {
        fetchData(1);
    }
  }, [fetchData, page]); // <-- ARRAY DEPENDENSI INI MEMPERBAIKI LOOP


  // Fungsi untuk memuat halaman berikutnya
  const loadMore = () => {
    // Jangan muat jika sedang memuat atau tidak ada data lagi
    if (isLoading || isLoadingMore || notifications.length >= total) return; 
    
    const nextPage = page + 1;
    setPage(nextPage); // Mengubah 'page' akan memicu fetch data untuk halaman berikutnya
    fetchData(nextPage);
  };

  // Hitung apakah masih ada data untuk dimuat
  const hasMore = notifications.length < total;

  // --- Fungsi Aksi (Mark/Delete) ---

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Logika "Tandai Semua"
  const markAllAsRead = useCallback(async () => {
    try {
      // Panggil service baru yang efisien
      await markAllAsReadService(); 
      // Panggil refetch() untuk memuat ulang data dari halaman 1
      refetch(); 
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [refetch]); // Dependensi ke refetch

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotificationById(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  return {
    notifications,
    isLoading, // Untuk loading awal
    isLoadingMore, // Untuk tombol "Load More"
    error,
    hasMore, // boolean (true jika masih ada data)
    loadMore, // fungsi
    refetch, // fungsi
    markAsRead,
    markAllAsRead, // <-- Sekarang sudah benar
    deleteNotification
  };
};