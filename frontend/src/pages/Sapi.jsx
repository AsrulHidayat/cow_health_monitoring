import React, { useState, useEffect } from "react";
import { getSensorStatus } from "../services/temperatureService";
import { getActivitySensorStatus } from "../services/activityService";

import axios from "axios";
import Navbar from "../components/layout/Navbar";
import AddCowModal from "../components/dashboard/AddCowModal";
import DashboardPerSapi from "../components/dashboard/DashboardPerSapi";
import cowIcon from "../assets/cow.png";
import notifIcon from "../assets/notif-cow.png";
import plusIcon from "../assets/plus-icon.svg";
import CowDropdown from "../components/layout/Dropdown";
import "flowbite";

export default function Sapi() {
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

  // 🔹 Ambil data sapi dari backend saat halaman pertama kali dibuka
  useEffect(() => {
    const controller = new AbortController(); // untuk membatalkan fetch bila komponen di-unmount

    const fetchCows = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // ambil token login
        if (!token) {
          setCows([]);
          setSelectedCow(null);
          setLoading(false);
          return;
        }

        // 🔹 Request ke API untuk ambil daftar sapi
        const res = await axios.get("http://localhost:5001/api/cows", {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        // 🔹 Jika ada data sapi, pilih sapi pertama sebagai default
        if (Array.isArray(data) && data.length > 0) {
          setCows(data);
          setSelectedCow(data[0]);
          setCowId(data[0].id);
        } else {
          setCows([]);
          setSelectedCow(null);
          setCowId(null);
        }
      } catch (error) {
        // 🔹 Tangani error bila request dibatalkan atau gagal
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
    return () => controller.abort(); // bersihkan fetch bila keluar dari halaman
  }, []);

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
      // Jika belum ada sapi dipilih → semua sensor dianggap offline
      setSensorStatuses({
        temperature: "offline",
        activity: "offline",
        heartbeat: "offline"
      });
      return;
    }

    const checkAllSensorStatus = async () => {
      try {
        // 🔹 Ambil status sensor suhu & gerakan dari service
        const tempStatus = await getSensorStatus(selectedCow.id);
        const activityStatus = await getActivitySensorStatus(selectedCow.id);

        // 🔹 Simpan status sensor ke state
        setSensorStatuses({
          temperature: tempStatus.status,
          activity: activityStatus.status,
          heartbeat: "development" // belum aktif, masih tahap pengembangan
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

    // 🔹 Jalankan pertama kali
    checkAllSensorStatus();

    // 🔹 Cek ulang setiap 5 detik (polling)
    const interval = setInterval(checkAllSensorStatus, 5000);

    return () => clearInterval(interval); // hentikan interval jika komponen di-unmount
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

      // 🔹 Hitung nomor tag sapi berikutnya
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

      // 🔹 Kirim data sapi baru ke backend
      const res = await axios.post("http://localhost:5001/api/cows", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const addedCow = res.data;
      setCows((prev) => [...prev, addedCow]); // tambahkan ke daftar sapi
      setSelectedCow(addedCow); // jadikan sapi baru sebagai yang aktif
      setCowId(addedCow.id);
      alert("✅ Sapi berhasil ditambahkan!");
    } catch (error) {
      console.error("❌ Gagal menambahkan sapi:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Gagal menambahkan sapi. Coba lagi.";
      alert(errorMsg);
    }
  };

  // 🔹 UI utama halaman dashboard sapi
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar title="Dashboard Persapi" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-126px)]">
          {/* KOLOM 1: Tambah + Grafik */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {/* Tombol tambah sapi */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-3 mb-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
              >
                <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
                <span className="text-blue-600 font-medium">Tambah Sapi</span>
              </button>

              {/* Dropdown pilih sapi */}
              {cows.length > 0 && (
                <div className="flex items-center gap-6">
                  <CowDropdown
                    value={cowId}
                    onChange={(val) => setCowId(Number(val))}
                    options={cows
                      .sort((a, b) => a.tag.localeCompare(b.tag))
                      .map((c) => ({ id: c.id, name: c.tag }))}
                  />
                </div>
              )}
            </div>

            {/* Status Sensor - tampilkan tiga sensor */}
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

                {/* Sensor Detak Jantung (belum aktif) */}
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
              {/* Header realtime */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Realtime Monitoring</h2>
                  <span className="text-gray-400 cursor-help text-sm">ℹ︎</span>
                </div>
              </div>

              {/* Isi konten realtime */}
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
                  <DashboardPerSapi cow={selectedCow} sensorStatuses={sensorStatuses} />
                )}
              </div>
            </div>
          </div>

          {/* KOLOM 2: Notifikasi */}
          <div className="lg:col-span-2 bg-green-50 rounded-xl p-6 flex flex-col border border-green-100 h-full">
            <div className="flex justify-between mb-2">
              <h3 className="text-gray-800 font-semibold">Notifikasi</h3>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-green-600 transition">
                Mark as read
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <img src={notifIcon} alt="Notif" className="w-64 h-64 opacity-70 mb-4" />
              <h3 className="text-green-600 font-semibold text-sm">BELUM ADA NOTIF</h3>
            </div>
          </div>
        </div>
      </main>

      {/* Modal tambah sapi */}
      {showModal && (
        <AddCowModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCow}
          cowCount={cows.length}
        />
      )}
    </div>
  );
}
