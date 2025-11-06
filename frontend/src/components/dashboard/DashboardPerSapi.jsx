import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPerSapi({ cow, sensorStatuses }) {
  const [temperature, setTemperature] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cow) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch temperature data
        const tempRes = await axios.get(
          `http://localhost:5001/api/temperature/${cow.id}/latest`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch activity data
        const actRes = await axios.get(
          `http://localhost:5001/api/activity/${cow.id}/latest`
        );

        setTemperature(tempRes.data);
        setActivity(actRes.data);
      } catch (error) {
        console.error("Gagal memuat data sensor:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Polling setiap 5 detik
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [cow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Memuat data sensor...</p>
        </div>
      </div>
    );
  }

  // Helper function untuk kategori suhu
  const getTempCategory = (temp) => {
    if (!temp) return { label: "N/A", color: "gray" };
    if (temp < 37.5) return { label: "Hipotermia", color: "blue" };
    if (temp >= 37.5 && temp <= 39.5) return { label: "Normal", color: "green" };
    if (temp > 39.5 && temp <= 40.5) return { label: "Demam Ringan", color: "yellow" };
    if (temp > 40.5 && temp <= 41.5) return { label: "Demam Tinggi", color: "orange" };
    return { label: "Kritis", color: "red" };
  };

  // Helper function untuk kategori aktivitas
  const getActivityCategory = (x, y, z) => {
    if (x == null || y == null || z == null) return { label: "N/A", color: "gray" };
    
    // Berdiri
    if (x >= -1.2 && x <= 0.1 && y >= -3.0 && y <= 0.0 && z >= 10.5 && z <= 12.0) {
      return { label: "Berdiri", color: "green" };
    }
    
    // Berbaring Kanan
    if ((x >= -0.6 && x <= 0.2 && y >= 4.0 && y <= 7.2 && z >= 7.3 && z <= 11.2) ||
        (x >= 0.0 && x <= 0.4 && y >= 9.8 && y <= 10.8 && z >= 2.8 && z <= 4.3)) {
      return { label: "Berbaring Kanan", color: "blue" };
    }
    
    // Berbaring Kiri
    if ((x >= -0.6 && x <= 0.2 && y >= -10.2 && y <= -6.3 && z >= 5.3 && z <= 8.7) ||
        (x >= 0.2 && x <= 0.8 && y >= -10.8 && y <= -9.6 && z >= -0.1 && z <= 2.7)) {
      return { label: "Berbaring Kiri", color: "cyan" };
    }
    
    return { label: "N/A", color: "gray" };
  };

  const tempCategory = getTempCategory(temperature?.temperature);
  const activityCategory = activity ? getActivityCategory(activity.x, activity.y, activity.z) : { label: "N/A", color: "gray" };

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
    gray: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Suhu */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Suhu Tubuh</h3>
                <p className="text-white/80 text-xs mt-1">Temperature Sensor</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {sensorStatuses.temperature === "online" && temperature ? (
              <>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-gray-800">
                    {temperature.temperature.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-500 ml-2">°C</span>
                </div>
                
                <div className="flex justify-center mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${colorClasses[tempCategory.color]}`}>
                    {tempCategory.label}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Terakhir Update:</span>
                    <span className="font-medium">
                      {new Date(temperature.created_at).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Sensor Tidak Aktif</p>
                <p className="text-gray-400 text-sm mt-1">Tidak ada data</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Gerakan */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Aktivitas</h3>
                <p className="text-white/80 text-xs mt-1">Motion Sensor</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {sensorStatuses.activity === "online" && activity ? (
              <>
                <div className="flex justify-center mb-4">
                  <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${colorClasses[activityCategory.color]}`}>
                    {activityCategory.label}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sumbu X:</span>
                    <span className="font-bold text-red-600">{activity.x.toFixed(2)} m/s²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sumbu Y:</span>
                    <span className="font-bold text-blue-600">{activity.y.toFixed(2)} m/s²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sumbu Z:</span>
                    <span className="font-bold text-green-600">{activity.z.toFixed(2)} m/s²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Magnitude:</span>
                    <span className="font-bold text-purple-600">{activity.magnitude.toFixed(2)} m/s²</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Terakhir Update:</span>
                    <span className="font-medium">
                      {new Date(activity.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Sensor Tidak Aktif</p>
                <p className="text-gray-400 text-sm mt-1">Tidak ada data</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Detak Jantung */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Detak Jantung</h3>
                <p className="text-white/80 text-xs mt-1">Heart Rate Sensor</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Dalam Pengembangan</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sensor detak jantung sedang dalam tahap pengembangan dan akan segera tersedia
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Info:</strong> Fitur monitoring detak jantung akan menampilkan BPM (Beats Per Minute) real-time untuk deteksi dini gangguan kesehatan pada sapi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Tambahan */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">Monitoring Real-time</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Data dari semua sensor diperbarui secara otomatis setiap 5 detik untuk memastikan informasi kesehatan sapi selalu up-to-date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}