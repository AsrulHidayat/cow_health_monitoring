import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import AddCowModal from "../components/dashboard/AddCowModal";
import cowIcon from "../assets/cow.png";
import plusIcon from "../assets/plus-icon.svg";

// 🔔 1. IMPORT KOMPONEN NOTIFIKASI
import NotificationPreview from "../components/notifications/NotificationPreview";
import NotificationPanel from "../components/notifications/NotificationPanel";

export default function Dashboard() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🔔 2. TAMBAHKAN STATE NOTIFIKASI
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/cows", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        console.log("🐮 Data sapi dari backend:", data);

        // Pastikan data adalah array
        if (Array.isArray(data)) {
          setCows(data);
        } else {
          console.warn("⚠️ Response bukan array:", data);
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

  // 🔔 3. TAMBAHKAN USEEFFECT UNTUK FETCH NOTIFIKASI
  useEffect(() => {
    // Simulasi fetch notifikasi dari API untuk SEMUA sapi
    const fetchNotifications = async () => {
      try {
        // TODO: Ganti dengan API call sebenarnya (misal: /api/notifications/all)
        // const res = await axios.get(`http://localhost:5001/api/notifications`);
        // setNotifications(res.data);

        // Mock data untuk demo (menampilkan notif dari berbagai sapi)
        const mockNotifications = [
          {
            id: 1,
            sapiId: 1, // Asumsi ID sapi
            sapiName: "SAPI-001", // Asumsi nama
            type: 'urgent',
            parameters: ['suhu', 'detak jantung'],
            severity: 'Segera Tindaki',
            message: 'Suhu tubuh SAPI-001 mencapai 40.5°C',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 menit lalu
            isRead: false
          },
          {
            id: 2,
            sapiId: 2, // Asumsi ID sapi
            sapiName: "SAPI-002", // Asumsi nama
            type: 'warning',
            parameters: ['gerakan'],
            severity: 'Harus Diperhatikan',
            message: 'Aktivitas gerakan SAPI-002 menurun drastis',
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 jam lalu
            isRead: false
          },
          {
            id: 3,
            sapiId: 1, // Asumsi ID sapi
            sapiName: "SAPI-001", // Asumsi nama
            type: 'urgent',
            parameters: ['suhu'],
            severity: 'Segera Tindaki',
            message: 'Suhu tubuh SAPI-001 tidak stabil',
            timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 jam lalu
            isRead: true
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("❌ Gagal memuat notifikasi:", error);
      }
    };

    fetchNotifications();
    
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []); // Array dependensi kosong, fetch saat komponen mount

  const handleAddCow = async (newCow) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        return;
      }

      // Validasi umur
      if (!newCow.umur || newCow.umur.trim() === "") {
        alert("Umur sapi harus diisi!");
        return;
      }

      // 🔢 Cari ID yang kosong (gap filling)
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

      console.log("📤 Data yang akan dikirim:", {
        tag: newTag,
        umur: newCow.umur,
        user_id: user._id
      });

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

      console.log("✅ Response dari server:", res.data);

      const addedCow = res.data;
      setCows((prev) => [...prev, addedCow]);
      alert("✅ Sapi berhasil ditambahkan!");
    } catch (error) {
      console.error("❌ Gagal menambahkan sapi:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Gagal menambahkan sapi. Coba lagi.";
      alert(errorMsg);
    }
  };

  // 🔔 4. TAMBAHKAN FUNGSI HANDLER NOTIFIKASI
  const handleMarkAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notifId ? { ...notif, isRead: true } : notif
      )
    );
    // TODO: Panggil API untuk update status
    // axios.patch(`http://localhost:5001/api/notifications/${notifId}/read`);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    // TODO: Panggil API untuk update semua status
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notifId));
    // TODO: Panggil API untuk hapus notifikasi
    // axios.delete(`http://localhost:5001/api/notifications/${notifId}`);
  };

  const handleViewDetail = () => {
    // Di dashboard utama, kita hanya tutup panelnya.
    // Navigasi ke halaman sapi spesifik bisa ditambahkan di sini jika perlu.
    setIsNotificationOpen(false);
  };

  // Tampilkan ID sapi pertama jika ada data
  const firstCowId = Array.isArray(cows) && cows.length > 0 ? cows[0].tag : null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar title="Dashboard Ternak" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-126px)]">
          {/* ========================== */}
          {/* KOLOM 1: Tambah + Grafik */}
          {/* ========================== */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Tombol Tambah Sapi */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-3 mb-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
              >
                <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
                <span className="text-blue-600 font-medium">Tambah Sapi</span>
              </button>

              {/* Tampilkan ID Sapi pertama jika ada */}
              {firstCowId && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-gray-600">ID Sapi:</span>
                  <span className="font-semibold text-green-700">{firstCowId}</span>
                </div>
              )}
            </div>

            {/* Card Realtime Graphics */}
            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Cow Card
                  </h2>
                  <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center text-center rounded-b-xl bg-gray-50">
                {loading ? (
                  <div className="text-gray-400">Memuat data sapi...</div>
                ) : cows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center w-full h-full bg-gray-50">
                    <img src={cowIcon} alt="No Data" className="w-24 h-24 mb-4 opacity-90" />
                    <p className="text-gray-700 font-medium">Belum ada ID sapi yang terdaftar.</p>
                    <p className="text-gray-400 text-sm">
                      Tambahkan data sapi terlebih dahulu untuk memulai monitoring.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-gray-600 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(cows) && cows.map((cow, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{cow.tag}</p>
                              <p className="text-sm text-gray-500">Umur: {cow.umur}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">🐄</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================== */}
          {/* KOLOM 2: Notifikasi */}
          {/* ========================== */}
          {/* 🔔 5. GANTI UI STATIS DENGAN KOMPONEN PREVIEW */}
          <NotificationPreview 
            notifications={notifications}
            onOpenPanel={() => setIsNotificationOpen(true)}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </main>

      {showModal && (
        <AddCowModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCow}
          cows={cows} // Tetap gunakan 'cows' sesuai kode asli Anda
        />
      )}

      {/* 🔔 6. TAMBAHKAN PANEL NOTIFIKASI DI AKHIR */}
      <NotificationPanel 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        sapiName="Semua Sapi" // Judul generik untuk dashboard
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
}