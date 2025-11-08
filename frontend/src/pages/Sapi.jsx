import React, { useState, useEffect } from "react";
import { getSensorStatus } from "../services/temperatureService";
import { getActivitySensorStatus } from "../services/activityService";

import axios from "axios";
import Navbar from "../components/layout/Navbar";
import AddCowModal from "../components/dashboard/AddCowModal";
import DashboardPerSapi from "../components/dashboard/DashboardPerSapi";
import cowIcon from "../assets/cow.png";
import plusIcon from "../assets/plus-icon.svg";
import CowDropdown from "../components/layout/Dropdown";

// 🔔 IMPORT KOMPONEN NOTIFIKASI BARU
import NotificationBadge from "../components/notifications/NotificationBadge";
import NotificationPanel from "../components/notifications/NotificationPanel";
import NotificationPreview from "../components/notifications/NotificationPreview";

import "flowbite";

export default function Sapi({ onNavigate }) {
  // 🔹 State utama untuk menyimpan data sapi dan status sensor
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [sensorStatuses, setSensorStatuses] = useState({
    temperature: "loading",
    activity: "loading",
    heartbeat: "loading"
  });

  // 🔔 STATE NOTIFIKASI
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🔔 CUSTOM HOOK UNTUK NOTIFIKASI (opsional, atau pakai state biasa)
  // const { notifications, unreadCount, handleMarkAsRead, handleDelete } = useNotifications(userId);

  // 🔹 Ambil data sapi dari backend saat halaman pertama kali dibuka
  useEffect(() => {
    const controller = new AbortController();

    const fetchCows = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCows([]);
          setSelectedCow(null);
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5001/api/cows", {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        console.log("🐮 Data sapi dari backend:", data);

        if (Array.isArray(data) && data.length > 0) {
          const sortedCows = data.sort((a, b) => a.tag.localeCompare(b.tag));
          setCows(sortedCows);
          setSelectedCow(sortedCows[0]);
          setCowId(sortedCows[0].id);
        } else {
          setCows([]);
          setSelectedCow(null);
          setCowId(null);
        }
      } catch (error) {
        if (error.name === "CanceledError" || axios.isCancel?.(error)) {
          console.log("fetchCows canceled");
        } else {
          console.error("❌ Gagal memuat data sapi:", error.response?.data || error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
    return () => controller.abort();
  }, []);

  // 🔔 FETCH NOTIFIKASI UNTUK SAPI YANG DIPILIH
  useEffect(() => {
    if (!selectedCow) {
      setNotifications([]);
      return;
    }

    // Simulasi fetch notifikasi dari API
    const fetchNotifications = async () => {
      try {
        // TODO: Ganti dengan API call sebenarnya
        // const res = await axios.get(`http://localhost:5001/api/notifications?cowId=${selectedCow.id}`);
        // setNotifications(res.data);

        // Mock data untuk demo
        const mockNotifications = [
          {
            id: 1,
            sapiId: selectedCow.id,
            sapiName: selectedCow.tag,
            type: 'urgent',
            parameters: ['suhu', 'detak jantung'],
            severity: 'Segera Tindaki',
            message: 'Suhu tubuh mencapai 40.5°C dan detak jantung 110 bpm (abnormal)',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 menit lalu
            isRead: false
          },
          {
            id: 2,
            sapiId: selectedCow.id,
            sapiName: selectedCow.tag,
            type: 'warning',
            parameters: ['gerakan'],
            severity: 'Harus Diperhatikan',
            message: 'Aktivitas gerakan menurun drastis dalam 2 jam terakhir',
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 jam lalu
            isRead: false
          },
          {
            id: 3,
            sapiId: selectedCow.id,
            sapiName: selectedCow.tag,
            type: 'urgent',
            parameters: ['suhu'],
            severity: 'Segera Tindaki',
            message: 'Suhu tubuh tidak stabil, variasi 38-41°C dalam 1 jam',
            timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 jam lalu
            isRead: true
          }
        ];

        // Filter hanya notifikasi untuk sapi yang dipilih
        const filteredNotifications = mockNotifications.filter(
          n => n.sapiId === selectedCow.id
        );
        
        setNotifications(filteredNotifications);
      } catch (error) {
        console.error("❌ Gagal memuat notifikasi:", error);
      }
    };

    fetchNotifications();
    
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [selectedCow]);

  // 🔔 HANDLER NOTIFIKASI
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
    // Tutup panel notifikasi dan navigasi ke detail sapi
    setIsNotificationOpen(false);
    // Logic untuk navigasi ke detail sapi bisa ditambahkan di sini
  };

  // 🔹 Update sapi yang dipilih ketika cowId berubah
  useEffect(() => {
    if (cowId && cows.length > 0) {
      const cow = cows.find(c => c.id === cowId);
      if (cow) {
        setSelectedCow(cow);
      }
    }
  }, [cowId, cows]);

  // 🔹 Cek status semua sensor (suhu, gerakan, detak jantung)
  useEffect(() => {
    if (!selectedCow) {
      setSensorStatuses({
        temperature: "offline",
        activity: "offline",
        heartbeat: "offline"
      });
      return;
    }

    const checkAllSensorStatus = async () => {
      try {
        const tempStatus = await getSensorStatus(selectedCow.id);
        const activityStatus = await getActivitySensorStatus(selectedCow.id);

        setSensorStatuses({
          temperature: tempStatus.status,
          activity: activityStatus.status,
          heartbeat: "development"
        });
      } catch (err) {
        console.error("⚠️ Gagal memeriksa status sensor:", err);
        setSensorStatuses({
          temperature: "offline",
          activity: "offline",
          heartbeat: "development"
        });
      }
    };

    checkAllSensorStatus();
    const interval = setInterval(checkAllSensorStatus, 5000);

    return () => clearInterval(interval);
  }, [selectedCow]);

  // 🔹 Fungsi untuk menambah sapi baru
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
      setSelectedCow(addedCow);
      setCowId(addedCow.id);
      alert("✅ Sapi berhasil ditambahkan!");
    } catch (error) {
      console.error("❌ Gagal menambahkan sapi:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Gagal menambahkan sapi. Coba lagi.";
      alert(errorMsg);
    }
  };

  // 🔹 Fungsi navigasi ke halaman sensor detail
  const handleNavigateToSensor = (sensorType) => {
    console.log(`🔄 Navigasi ke halaman ${sensorType}`);
    if (onNavigate) {
      onNavigate(sensorType);
    }
  };

  // 🔔 HITUNG UNREAD COUNT
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 🔹 UI utama halaman dashboard sapi
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar title="Dashboard Persapi" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-126px)]">
          {/* KOLOM 1: Tambah + Grafik */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-3 mb-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
              >
                <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
                <span className="text-blue-600 font-medium">Tambah Sapi</span>
              </button>

              {cows.length > 0 && (
                <div className="flex items-center gap-6">
                  <CowDropdown
                    value={cowId}
                    onChange={(val) => setCowId(Number(val))}
                    options={cows
                      .sort((a, b) => a.tag.localeCompare(b.tag))
                      .map((c) => ({ id: c.id, name: c.tag }))}
                  />
                  
                  {/* 🔔 NOTIFICATION BADGE - DITAMBAHKAN DI SINI */}
                  <NotificationBadge 
                    count={unreadCount}
                    onClick={() => setIsNotificationOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Status Sensor */}
            {cows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sensor Suhu */}
                <div className={`rounded-xl p-4 border-l-4 ${sensorStatuses.temperature === "online"
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
                    : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${sensorStatuses.temperature === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                          }`}></div>
                        <h3 className={`text-sm font-bold ${sensorStatuses.temperature === "online" ? "text-green-700" : "text-red-700"
                          }`}>Sensor Suhu</h3>
                      </div>
                      <p className={`text-xs ${sensorStatuses.temperature === "online" ? "text-green-600" : "text-red-600"
                        }`}>
                        {sensorStatuses.temperature === "online" ? "Aktif" : "Tidak Aktif"}
                      </p>
                    </div>
                    <svg className={`w-8 h-8 ${sensorStatuses.temperature === "online" ? "text-green-500" : "text-red-500"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>

                {/* Sensor Gerakan */}
                <div className={`rounded-xl p-4 border-l-4 ${sensorStatuses.activity === "online"
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
                    : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${sensorStatuses.activity === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                          }`}></div>
                        <h3 className={`text-sm font-bold ${sensorStatuses.activity === "online" ? "text-green-700" : "text-red-700"
                          }`}>Sensor Gerakan</h3>
                      </div>
                      <p className={`text-xs ${sensorStatuses.activity === "online" ? "text-green-600" : "text-red-600"
                        }`}>
                        {sensorStatuses.activity === "online" ? "Aktif" : "Tidak Aktif"}
                      </p>
                    </div>
                    <svg className={`w-8 h-8 ${sensorStatuses.activity === "online" ? "text-green-500" : "text-red-500"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* Sensor Detak Jantung */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <h3 className="text-sm font-bold text-yellow-700">Detak Jantung</h3>
                      </div>
                      <p className="text-xs text-yellow-600">Tahap Pengembangan</p>
                    </div>
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* CARD REALTIME GRAPHICS */}
            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Realtime Monitoring</h2>
                  <span className="text-gray-400 cursor-help text-sm">ℹ︎</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center text-center rounded-b-xl bg-gray-50 overflow-auto">
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
                  <DashboardPerSapi 
                    cow={selectedCow} 
                    sensorStatuses={sensorStatuses}
                    onNavigate={handleNavigateToSensor}
                  />
                )}
              </div>
            </div>
          </div>

          {/* KOLOM 2: Notifikasi - GUNAKAN KOMPONEN PREVIEW */}
          <NotificationPreview 
            notifications={notifications}
            onOpenPanel={() => setIsNotificationOpen(true)}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </main>

      {/* MODAL TAMBAH SAPI */}
      {showModal && (
        <AddCowModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCow}
          cowCount={cows.length}
        />
      )}

      {/* 🔔 NOTIFICATION PANEL - OVERLAY PENUH */}
      <NotificationPanel 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        sapiName={selectedCow?.tag || 'Sapi'}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
}