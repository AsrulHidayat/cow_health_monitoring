import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPerSapi({ cow, sensorStatuses }) {
  const [temperatureData, setTemperatureData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================================
  // 🔹 Mengambil data dari API setiap 5 detik
  // ========================================================
useEffect(() => {
  if (!cow) return;
  let isFirst = true;

  const fetchData = async () => {
    try {
      if (isFirst) setLoading(true);
      const token = localStorage.getItem("token");

      const [tempRes, actRes] = await Promise.all([
        fetch(`http://localhost:5001/api/temperature/${cow.id}/history?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5001/api/activity/${cow.id}/history?limit=30`),
      ]);

      const tempJson = await tempRes.json();
      const actJson = await actRes.json();

      const tempFormatted = tempJson.data.map((item) => ({
        time: new Date(item.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: parseFloat(item.temperature.toFixed(1)),
        fullDate: item.created_at,
      })).reverse();

      const actFormatted = actJson.data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: parseFloat(item.magnitude.toFixed(1)),
        fullDate: item.timestamp,
      })).reverse();

      setTemperatureData(tempFormatted);
      setActivityData(actFormatted);
    } catch (error) {
      console.error("Gagal memuat data sensor:", error);
    } finally {
      if (isFirst) {
        setLoading(false);
        isFirst = false;
      }
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, [cow]);

  // ========================================================
  // 🔹 Loading State
  // ========================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Memuat data sensor...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // 🔹 Fungsi kategori suhu dan aktivitas
  // ========================================================
  const getTempCategory = (temp) => {
    if (!temp) return { label: "N/A", color: "gray" };
    if (temp < 37.5) return { label: "Hipotermia", color: "blue" };
    if (temp >= 37.5 && temp <= 39.5)
      return { label: "Normal", color: "green" };
    if (temp > 39.5 && temp <= 40.5)
      return { label: "Demam Ringan", color: "yellow" };
    if (temp > 40.5 && temp <= 41.5)
      return { label: "Demam Tinggi", color: "orange" };
    return { label: "Kritis", color: "red" };
  };

  const getActivityCategory = (value) => {
    if (value == null) return { label: "N/A", color: "gray" };
    if (value < 9.5) return { label: "Berbaring", color: "blue" };
    if (value >= 9.5 && value <= 11.0)
      return { label: "Berdiri", color: "green" };
    return { label: "Aktif Bergerak", color: "orange" };
  };

  const latestTemp = temperatureData[temperatureData.length - 1];
  const latestActivity = activityData[activityData.length - 1];
  const tempCategory = getTempCategory(latestTemp?.temperature);
  const activityCategory = getActivityCategory(latestActivity?.value);

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    gray: "bg-gray-100 text-gray-700 border-gray-300",
  };

  // ========================================================
  // 🔹 Komponen Tooltip Kustom
  // ========================================================
  const TempTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    const category = getTempCategory(data.temperature);

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-800 mb-2">
          {data.temperature?.toFixed(1)}°C
        </p>
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${colorClasses[category.color]}`}
        >
          {category.label}
        </div>
        <p className="text-xs text-gray-600">{data.time}</p>
      </div>
    );
  };

  const ActivityTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    const category = getActivityCategory(data.value);

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-800 mb-2">
          {data.value?.toFixed(1)} m/s²
        </p>
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${colorClasses[category.color]}`}
        >
          {category.label}
        </div>
        <p className="text-xs text-gray-600">{data.time}</p>
      </div>
    );
  };

  // ========================================================
  // 🔹 Tampilan Dashboard Utama
  // ========================================================

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Grafik Suhu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tigh">Grafik Suhu Tubuh Real-time</h3>
              <p className="text-white/80 text-xs mt-1">Monitoring suhu dalam 30 data terakhir</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {sensorStatuses.temperature === "online" && temperatureData.length > 0 ? (
            <>
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">
                    {latestTemp?.temperature?.toFixed(1)}°C
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colorClasses[tempCategory.color]}`}>
                    {tempCategory.label}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="text-sm font-semibold text-gray-700">{latestTemp?.time}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={temperatureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickFormatter={(value) => `${value.toFixed(1)}°`}
                      width={50}
                    />
                    <Tooltip content={<TempTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Suhu Minimum</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.min(...temperatureData.map(d => d.temperature)).toFixed(1)}°C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Suhu Maximum</p>
                  <p className="text-lg font-bold text-red-600">
                    {Math.max(...temperatureData.map(d => d.temperature)).toFixed(1)}°C
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Sensor Tidak Aktif</p>
              <p className="text-gray-400 text-sm mt-1">Tidak ada data suhu yang tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Grafik Aktivitas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tigh">Grafik Aktivitas Real-time</h3>
              <p className="text-white/80 text-xs mt-1">Monitoring gerakan dalam 30 data terakhir</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {sensorStatuses.activity === "online" && activityData.length > 0 ? (
            <>
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">
                    {latestActivity?.value?.toFixed(1)} m/s²
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colorClasses[activityCategory.color]}`}>
                    {activityCategory.label}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="text-sm font-semibold text-gray-700">{latestActivity?.time}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickFormatter={(value) => `${value.toFixed(1)}`}
                      width={50}
                    />
                    <Tooltip content={<ActivityTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Aktivitas Minimum</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.min(...activityData.map(d => d.value)).toFixed(1)} m/s²
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Aktivitas Maximum</p>
                  <p className="text-lg font-bold text-purple-600">
                    {Math.max(...activityData.map(d => d.value)).toFixed(1)} m/s²
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Sensor Tidak Aktif</p>
              <p className="text-gray-400 text-sm mt-1">Tidak ada data aktivitas yang tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Grafik Detak Jantung - Coming Soon */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-red-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tight">Grafik Detak Jantung</h3>
              <p className="text-white/80 text-xs mt-1">Coming Soon - fitur sedang dikembangkan</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="animate-pulse text-center">
              <svg className="w-16 h-16 mx-auto text-pink-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-gray-700 font-semibold text-lg">Grafik Detak Jantung Segera Hadir</p>
              <p className="text-gray-500 text-sm mt-2">Data detak jantung sapi akan segera tersedia untuk pemantauan real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 rounded-full p-2 flex-shrink-0 mt-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">Monitoring Real-time</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Grafik diperbarui setiap 5 detik dengan 30 data terakhir untuk monitoring kondisi terkini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}