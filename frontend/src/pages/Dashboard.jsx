// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import AddCowModal from "../components/dashboard/AddCowModal";

// 🔔 IMPORT KOMPONEN NOTIFIKASI
import NotificationPreview from "../components/notifications/NotificationPreview";
import NotificationPanel from "../components/notifications/NotificationPanel";

// ✨ IMPORT KOMPONEN DASHBOARD BARU
import { DashboardContent } from "../components/dashboard/DashboardContent"; // atau path artifact Anda

export default function Dashboard() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🔔 STATE NOTIFIKASI
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch data sapi
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/cows", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        if (Array.isArray(data)) {
          setCows(data);
        } else {
          setCows([]);
        }
      } catch (error) {
        console.error("❌ Gagal memuat data sapi:", error);
        setCows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
  }, []);

  // 🔔 FETCH NOTIFIKASI
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock data untuk demo
        const mockNotifications = [
          {
            id: 1,
            sapiId: 1,
            sapiName: "SAPI-001",
            type: 'urgent',
            parameters: ['suhu', 'detak jantung'],
            severity: 'Segera Tindaki',
            message: 'Suhu tubuh SAPI-001 mencapai 40.5°C',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            isRead: false
          },
          {
            id: 2,
            sapiId: 2,
            sapiName: "SAPI-002",
            type: 'warning',
            parameters: ['gerakan'],
            severity: 'Harus Diperhatikan',
            message: 'Aktivitas gerakan SAPI-002 menurun drastis',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            isRead: false
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("❌ Gagal memuat notifikasi:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handler tambah sapi
  const handleAddCow = async (newCow) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        return;
      }

      if (!newCow.umur || newCow.umur.trim() === "") {
        alert("Umur sapi harus diisi!");
        return;
      }

      const existingNumbers = cows
        .map(cow => {
          const match = cow.tag.match(/SAPI-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b);

      let nextNumber = 1;
      for (const num of existingNumbers) {
        if (num === nextNumber) {
          nextNumber++;
        } else if (num > nextNumber) {
          break;
        }
      }

      const newTag = `SAPI-${String(nextNumber).padStart(3, "0")}`;

      const payload = {
        tag: newTag,
        umur: newCow.umur,
        user_id: user._id,
      };

      const res = await axios.post("http://localhost:5001/api/cows", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const addedCow = res.data;
      setCows((prev) => [...prev, addedCow]);
      alert("✅ Sapi berhasil ditambahkan!");
    } catch (error) {
      console.error("❌ Gagal menambahkan sapi:", error.response?.data || error.message);
      alert("Gagal menambahkan sapi. Coba lagi.");
    }
  };

  // 🔔 HANDLER NOTIFIKASI
  const handleMarkAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notifId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notifId));
  };

  const handleViewDetail = () => {
    setIsNotificationOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar title="Dashboard Ternak" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* KOLOM KIRI: Dashboard Content (4 kolom) */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Memuat data sapi...
              </div>
            ) : (
              <DashboardContent 
                cows={cows} 
                onAddCow={() => setShowModal(true)}
              />
            )}
          </div>

          {/* KOLOM KANAN: Notifikasi (2 kolom) */}
          <div className="lg:col-span-2">
            <NotificationPreview 
              notifications={notifications}
              onOpenPanel={() => setIsNotificationOpen(true)}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </div>
      </main>

      {/* Modal Tambah Sapi */}
      {showModal && (
        <AddCowModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCow}
          cowCount={cows.length}
        />
      )}

      {/* Panel Notifikasi */}
      <NotificationPanel 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        sapiName="Semua Sapi"
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
}