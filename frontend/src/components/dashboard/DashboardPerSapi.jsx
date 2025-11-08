import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function DashboardPerSapi({ cow, sensorStatuses }) {
  const [temperatureData, setTemperatureData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================================
  // 🔹 Fungsi klasifikasi aktivitas (dari halaman Gerakan)
  // ========================================================
  const categorizeActivity = (x, y, z) => {
    if ([x, y, z].some(v => v == null || isNaN(v))) {
      return { label: "N/A", color: "#6B7280", value: "N/A" };
    }

    x = parseFloat(Number(x).toFixed(2));
    y = parseFloat(Number(y).toFixed(2));
    z = parseFloat(Number(z).toFixed(2));

    // Berdiri
    if (x >= -1.2 && x <= 0.1 && y >= -3.0 && y <= 0.0 && z >= 10.5 && z <= 12.0) {
      return { label: "Berdiri", color: "#22C55E", value: "Berdiri" };
    }

    // Berbaring Kanan (Posisi 1)
    if (x >= -0.6 && x <= 0.2 && y >= 4.0 && y <= 7.2 && z >= 7.3 && z <= 11.2) {
      return { label: "Berbaring Kanan", color: "#3B82F6", value: "Berbaring Kanan" };
    }

    // Berbaring Kanan (Posisi 2)
    if (x >= 0.0 && x <= 0.4 && y >= 9.8 && y <= 10.8 && z >= 2.8 && z <= 4.3) {
      return { label: "Berbaring Kanan", color: "#3B82F6", value: "Berbaring Kanan" };
    }

    // Berbaring Kiri (Posisi 1)
    if (x >= -0.6 && x <= 0.2 && y >= -10.2 && y <= -6.3 && z >= 5.3 && z <= 8.7) {
      return { label: "Berbaring Kiri", color: "#06B6D4", value: "Berbaring Kiri" };
    }

    // Berbaring Kiri (Posisi 2)
    if (x >= 0.2 && x <= 0.8 && y >= -10.8 && y <= -9.6 && z >= -0.1 && z <= 2.7) {
      return { label: "Berbaring Kiri", color: "#06B6D4", value: "Berbaring Kiri" };
    }

    // Fallback berdasarkan dominasi sumbu
    if (z > 9.0 && Math.abs(y) < 4.0) {
      return { label: "Berdiri", color: "#22C55E", value: "Berdiri" };
    }
    if (y > 4.0 && z > 4.3) {
      return { label: "Berbaring Kanan", color: "#3B82F6", value: "Berbaring Kanan" };
    }
    if (y < -6.0 && z > 2.7) {
      return { label: "Berbaring Kiri", color: "#06B6D4", value: "Berbaring Kiri" };
    }

    return { label: "N/A", color: "#6B7280", value: "N/A" };
  };

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

        // Format data suhu untuk BarChart
        const tempFormatted = tempJson.data.map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: parseFloat(item.temperature.toFixed(1)),
          fullDate: item.created_at,
        })).reverse();

        // Format data aktivitas dengan kategori
        const actFormatted = actJson.data.map((item) => {
          const category = categorizeActivity(item.x, item.y, item.z);
          return {
            time: new Date(item.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            activityLabel: category.label,
            activityColor: category.color,
            x: item.x,
            y: item.y,
            z: item.z,
            magnitude: item.magnitude,
            fullDate: item.timestamp,
          };
        }).reverse();

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
  // 🔹 Fungsi kategori suhu
  // ========================================================
  const getTempCategory = (temp) => {
    if (!temp) return { label: "N/A", color: "gray" };
    if (temp < 37.5) return { label: "Hipotermia", color: "blue" };
    if (temp >= 37.5 && temp <= 39.5) return { label: "Normal", color: "green" };
    if (temp > 39.5 && temp <= 40.5) return { label: "Demam Ringan", color: "yellow" };
    if (temp > 40.5 && temp <= 41.5) return { label: "Demam Tinggi", color: "orange" };
    return { label: "Kritis", color: "red" };
  };

  const getBarColor = (temp) => {
    if (temp == null) return "transparent";
    if (temp < 37.5) return "#3B82F6";
    if (temp >= 37.5 && temp <= 39.5) return "#22C55E";
    if (temp > 39.5 && temp <= 40.5) return "#EAB308";
    if (temp > 40.5 && temp <= 41.5) return "#F97316";
    return "#EF4444";
  };

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
    const temp = payload[0].value;
    if (temp == null) return null;

    const category = getTempCategory(temp);

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-base font-bold text-gray-800 mb-1">
          {temp.toFixed(1)}°C - {category.label}
        </p>
        <div className="border-t border-gray-100 pt-2 mt-2">
          <p className="text-sm text-gray-600">
            {new Date(data.fullDate).toLocaleString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-sm font-medium text-gray-700">{data.time}</p>
        </div>
      </div>
    );
  };

  const ActivityTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-800 mb-2">
          {data.activityLabel}
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>X: {data.x?.toFixed(2)} m/s²</p>
          <p>Y: {data.y?.toFixed(2)} m/s²</p>
          <p>Z: {data.z?.toFixed(2)} m/s²</p>
        </div>
        <p className="text-xs text-gray-600 mt-2">{data.time}</p>
      </div>
    );
  };

  const latestTemp = temperatureData[temperatureData.length - 1];
  const latestActivity = activityData[activityData.length - 1];
  const tempCategory = getTempCategory(latestTemp?.temperature);

  // ========================================================
  // 🔹 Tampilan Dashboard Utama
  // ========================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ============================================ */}
      {/* GRAFIK SUHU - BarChart */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tight">Grafik Suhu Tubuh Real-time</h3>
              <p className="text-white/80 text-xs mt-1">Monitoring suhu dalam 30 data terakhir</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

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

              {/* BarChart */}
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={temperatureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} horizontal={true} vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                      stroke="#d1d5db"
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#d1d5db"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value.toFixed(1)}°C`}
                    />
                    <Tooltip content={<TempTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.1)" }} />
                    <Bar dataKey="temperature" radius={[8, 8, 0, 0]} barSize={35}>
                      {temperatureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.temperature)} />
                      ))}
                    </Bar>
                  </BarChart>
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

      {/* ============================================ */}
      {/* GRAFIK AKTIVITAS - LineChart Kategori */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tight">Grafik Aktivitas Real-time</h3>
              <p className="text-white/80 text-xs mt-1">Monitoring aktivitas dalam 30 data terakhir</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sensorStatuses.activity === "online" && activityData.length > 0 ? (
            <>
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {latestActivity?.activityLabel || "N/A"}
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-full text-sm font-semibold border"
                    style={{
                      backgroundColor: `${latestActivity?.activityColor}20`,
                      color: latestActivity?.activityColor,
                      borderColor: latestActivity?.activityColor,
                    }}
                  >
                    Status Terkini
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="text-sm font-semibold text-gray-700">{latestActivity?.time}</p>
                </div>
              </div>

              {/* LineChart dengan Kategori pada Y-Axis */}
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={activityData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                      stroke="#d1d5db"
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      type="category"
                      dataKey="activityLabel"
                      domain={['N/A', 'Berbaring Kiri', 'Berbaring Kanan', 'Berdiri']}
                      tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip content={<ActivityTooltip />} />
                    <Line
                      type="step"
                      dataKey="activityLabel"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={payload.activityColor}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-4">
                {[
                  { label: "Berdiri", color: "#22C55E" },
                  { label: "Berbaring Kanan", color: "#3B82F6" },
                  { label: "Berbaring Kiri", color: "#06B6D4" },
                  { label: "N/A", color: "#6B7280" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                  </div>
                ))}
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
        <div className="bg-gradient-to-r from-pink-500 to-red-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-white font-bold text-lg leading-tight">Grafik Detak Jantung</h3>
              <p className="text-white/80 text-xs mt-1">Coming Soon - fitur sedang dikembangkan</p>
            </div>
            <button
              onClick={() => onNavigate?.('detak')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 ml-4 transition-all duration-200 flex items-center gap-2 group"
            >
              <span className="text-white text-sm font-medium">Detail</span>
              <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

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