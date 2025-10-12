import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import AddCowModal from "../components/AddCowModal";
import DashboardPerSapi from "../components/DashboardPerSapi"; 
import cowIcon from "../assets/cow.png";
import notifIcon from "../assets/notif-cow.png";
import plusIcon from "../assets/plus-icon.svg";
import SensorStatus from "../components/SensorStatus"; 
import Dropdown from "../components/Dropdown";



export default function Sapi() {
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [sensorStatus, setSensorStatus] = useState("loading");


  // ✅ Ambil data sapi dari backend saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/cows", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🐮 Data sapi dari backend:", res.data);
        if (res.data.length > 0) {
          setCows(res.data);
          setSelectedCow(res.data[0]); // otomatis pilih sapi pertama
        } else {
          setCows([]);
          setSelectedCow(null);
        }
      } catch (error) {
        console.error("❌ Gagal memuat data sapi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
  }, []);

  // ✅ Tambah sapi baru
  const handleAddCow = async (newCow) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        alert("User tidak terautentikasi. Silakan login kembali.");
        return;
      }

      const payload = {
        tag: newCow.tag,
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
      alert("✅ Sapi berhasil ditambahkan!");
    } catch (error) {
      console.error("❌ Gagal menambahkan sapi:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Gagal menambahkan sapi. Coba lagi.");
    }
  };

  useEffect(() => {
    if (!selectedCow) return;

    const checkSensorStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const [temp, heart, act] = await Promise.all([
          axios.get(`http://localhost:5001/api/temperature/${selectedCow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5001/api/heartbeat/${selectedCow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5001/api/activity/${selectedCow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const hasData =
          temp.data.length > 0 || heart.data.length > 0 || act.data.length > 0;
        setSensorStatus(hasData ? "online" : "offline");
      } catch (err) {
        console.error("⚠️ Gagal memeriksa status sensor:", err);
        setSensorStatus("offline");
      }
    };

    checkSensorStatus();
  }, [selectedCow]);


  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar title="Dashboard Persapi" />
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-126px)]">
          {/* ========================== */}
          {/* KOLOM 1: Tambah + Grafik */}
          {/* ========================== */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-3 mb-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
              >
                <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
                <span className="text-blue-600 font-medium">Tambah Sapi</span>
              </button>

              {/* Dropdown hanya tampil jika ada sapi */}
                {cows.length > 0 && (
                  <div className="flex items-center gap-6 px-6 py-4" >
                    <Dropdown
                      value={cowId}
                      onChange={(val) => setCowId(Number(val))}
                      options={cows.map((c) => ({ id: c.id, name: c.tag }))}
                    />
                  </div>
                )}

            </div>
            
            {/* Status Sensor */}
            <SensorStatus sensorStatus={sensorStatus} />

            {/* ========================== */}
            {/* CARD REALTIME GRAPHICS */}
            {/* ========================== */}
            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
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
                  <DashboardPerSapi cow={selectedCow} />
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
              <img src={notifIcon} alt="Notif" className="w-64 h-64 opacity-70 mb-4" />
              <h3 className="text-green-600 font-semibold text-sm">BELUM ADA NOTIF</h3>
            </div>
          </div>
        </div>
      </main>

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
