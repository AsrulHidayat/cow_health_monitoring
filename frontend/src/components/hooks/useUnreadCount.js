// frontend/src/components/hooks/useUnreadCount.js
import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../../services/notificationService'; // Sesuaikan path jika perlu

/**
 * Hook ringan untuk mengambil jumlah notifikasi yang belum dibaca.
 * Didesain untuk NotificationBadge (lonceng navbar).
 */
export const useUnreadCount = () => {
  const [count, setCount] = useState(0);

  // Fungsi untuk mengambil data hitungan dari service
  const fetchCount = useCallback(async () => {
    try {
      // Panggil service (GET /api/notifications/unread-count)
      const response = await getUnreadCount(); 
      
      // Backend mengembalikan { count: X }
      setCount(response.count || 0); 
    } catch (error) {
      console.error("Failed to fetch unread count:", error.message);
      setCount(0); // Set ke 0 jika gagal
    }
  }, []);

  useEffect(() => {
    // Ambil data saat komponen pertama kali dimuat
    fetchCount();

    // Atur interval untuk refresh hitungan secara otomatis
    // (Misalnya setiap 30 detik, samakan dengan useNotifications)
    const interval = setInterval(fetchCount, 30000); 

    // Bersihkan interval saat komponen di-unmount
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Kembalikan jumlah dan fungsi refetch manual
  return { count, refetch: fetchCount };
};