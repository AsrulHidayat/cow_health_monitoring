import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import cowIcon from "../assets/cow.png";
import notifIcon from "../assets/notif-cow.png";
import plusIcon from "../assets/plus-icon.svg";

export default function Sapi() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulasi ambil data
    setTimeout(() => {
      setCows([]); // kosong untuk contoh
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar title="Dashboard Persapi" />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-124px)]">
          {/* ========================== */}
          {/* KOLOM 1: Tambah + Grafik */}
          {/* ========================== */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Tombol Tambah Sapi */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition">
                <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
                <span className="text-blue-600 font-medium">Tambah Sapi</span>
              </button>
            </div>

            {/* Card Realtime Graphics */}
            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1">
              {/* Header Realtime */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
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

              {/* Konten Realtime */}
              <div className="flex-1 flex items-center justify-center text-center">
                {loading ? (
                  <div className="text-gray-400">Memuat data sapi...</div>
                ) : cows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center w-full h-full bg-gray-50">
                    <img
                      src={cowIcon}
                      alt="No Data"
                      className="w-24 h-24 mb-4 opacity-90"
                    />
                    <p className="text-gray-700 font-medium">
                      Belum ada ID sapi yang terdaftar.
                    </p>
                    <p className="text-gray-400 text-sm">
                      Tambahkan data sapi terlebih dahulu untuk memulai
                      monitoring.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-gray-600">Data sapi tampil di sini</div>
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
                className="w-28 h-28 opacity-70 mb-4"
              />
              <h3 className="text-green-600 font-semibold text-sm">
                BELUM ADA NOTIF
              </h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
