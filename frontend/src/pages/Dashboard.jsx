import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import AddCowModal from "../components/AddCowModal";
import cowIcon from "../assets/cow.png";
import notifIcon from "../assets/notif-cow.png";
import plusIcon from "../assets/plus-icon.svg";

export default function Dashboard() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      // Ambil semua nomor ID yang sudah ada
      const existingNumbers = cows
        .map(cow => {
          const match = cow.tag.match(/SAPI-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b);

      // Cari nomor terkecil yang belum terpakai
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
                    Realtime Graphics
                  </h2>
                  <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
                </div>
                <select className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition">
                  <option>Per Menit</option>
                  <option>Per Jam</option>
                </select>
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
          <div className="lg:col-span-2 bg-green-50 rounded-xl p-6 flex flex-col border border-green-100 h-full">
            <div className="flex justify-between mb-2">
              <h3 className="text-gray-800 font-semibold">Notifikasi</h3>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-green-600 transition">
                Mark as read
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <img
                src={notifIcon}
                alt="Notif"
                className="w-64 h-64 opacity-70 mb-4"
              />
              <h3 className="text-green-600 font-semibold text-sm">
                BELUM ADA NOTIF
              </h3>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <AddCowModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCow}
          cows={cows}
        />
      )}
    </div>
  );
}