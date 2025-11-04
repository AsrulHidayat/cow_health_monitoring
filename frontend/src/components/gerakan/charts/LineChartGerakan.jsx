import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { categorizeActivity, getCategoryStyles } from "../utils/activityUtils";

const LineChartGerakan = ({ data }) => {
  // === State untuk toggle antara mode Normal vs Detail ===
  const [isDetailMode, setIsDetailMode] = useState(false);

  // === Jika tidak ada data, tampilkan pesan kosong ===
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Tidak ada data untuk ditampilkan.
      </div>
    );
  }

  // === Ambil kategori aktivitas dari data terakhir ===
  //  PERBAIKAN: Gunakan 'magnitude' (data baru), bukan 'activity' (data lama) 
  const latest = data[data.length - 1];
  const activityCategory = categorizeActivity(latest.magnitude); // <-- DIUBAH
  const badgeStyle = getCategoryStyles(activityCategory.color);

  // === ✅ PERBAIKAN: Transform data untuk memastikan semua field numerik ===
  const cleanData = data.map((d, index) => {
    //  PERBAIKAN: Parsing 'x', 'y', 'z', 'magnitude' (data baru) 
    const magnitude = d.magnitude != null ? Number(d.magnitude) : null;
    const x = d.x != null ? Number(d.x) : null;
    const y = d.y != null ? Number(d.y) : null;
    const z = d.z != null ? Number(d.z) : null;

    return {
      // Preserve original data
      ...d,
      // Index untuk referensi
      index: index + 1,
      //  PERBAIKAN: Pastikan key yang benar diteruskan sebagai angka 
      magnitude: magnitude, // Key 'activity' diganti 'magnitude'
      x: x, // Key 'accel_x' diganti 'x'
      y: y, // Key 'accel_y' diganti 'y'
      z: z, // Key 'accel_z' diganti 'z'
      // Format time yang lebih baik
      timeLabel: d.time || new Date(d.fullDate).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      // Timestamp untuk sorting
      timestamp: new Date(d.fullDate).getTime()
    };
  }).sort((a, b) => a.timestamp - b.timestamp); // Sort by time ascending

  // === Custom Tooltip untuk format yang lebih baik ===
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
          {label || "N/A"}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            if (entry.value == null) return null;
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {entry.name}:
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: entry.color }}>
                  {isDetailMode
                    ? `${entry.value.toFixed(3)} m/s²`
                    : entry.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Tambahan info kategori untuk mode normal */}
        {!isDetailMode && payload[0]?.payload && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              Kategori: <span className="font-semibold">
                {/*  PERBAIKAN: Gunakan 'magnitude' untuk kategorisasi  */}
                {categorizeActivity(payload[0].payload.magnitude).label}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // === Custom Dot untuk mode normal (menampilkan warna berdasarkan kategori) ===
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return null;

    //  PERBAIKAN: Gunakan 'magnitude' untuk kategorisasi 
    const category = categorizeActivity(payload.magnitude);
    const colorMap = {
      blue: '#3B82F6',
      green: '#22C55E',
      yellow: '#EAB308',
      orange: '#F97316',
      red: '#EF4444',
      gray: '#6B7280',
    };
    const fillColor = colorMap[category.color] || '#8B5CF6';

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fillColor}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="relative w-full h-[400px]">
      {/* ===========================================================
          🔸 Header Controls - Mode Toggle & Badge
          =========================================================== */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
        {/* Toggle Button dengan indikator mode aktif */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDetailMode(!isDetailMode)}
            className={`text-xs px-4 py-2 rounded-lg shadow-md transition-all font-medium ${
              isDetailMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            {isDetailMode ? "📊 Mode Detail XYZ" : "📈 Mode Normal"}
          </button>
          
          {/* Label Mode */}
          <span className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {isDetailMode 
              ? "Menampilkan percepatan 3 sumbu" 
              : "Menampilkan tingkat aktivitas"}
          </span>

          {/* Info jumlah data */}
          <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {cleanData.length} data point
          </span>
        </div>

        {/* Badge Kategori Aktivitas (hanya untuk mode normal) */}
        {!isDetailMode && (
          <div
            className={`px-4 py-2 text-sm font-semibold border rounded-xl shadow-md ${badgeStyle}`}
          >
            {activityCategory.label}
          </div>
        )}
      </div>

      {/* ===========================================================
          🔸 Grafik Utama
          =========================================================== */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={cleanData}
          margin={{ top: 60, right: 40, left: 20, bottom: 60 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            opacity={0.5}
            vertical={false}
          />

          {/* Sumbu X - Waktu */}
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            angle={-45}
            textAnchor="end"
            height={80}
            label={{
              value: "Waktu",
              position: "insideBottomRight",
              offset: -5,
              style: { fontSize: 12, fill: '#374151', fontWeight: 600 }
            }}
          />

          {/* Sumbu Y - Dinamis berdasarkan mode */}
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            label={{
              value: isDetailMode
                ? "Percepatan (m/s²)"
                : "Tingkat Aktivitas",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: '#374151', fontWeight: 600 }
            }}
            domain={isDetailMode 
              ? ['auto', 'auto']
              : ['dataMin - 5', 'dataMax + 5']
            }
          />

          {/* Tooltip Custom */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend - hanya tampil di mode detail */}
          {isDetailMode && (
            <Legend 
              wrapperStyle={{
                paddingTop: "15px",
                fontSize: "12px",
                fontWeight: 500
              }}
              iconType="line"
              iconSize={16}
            />
          )}

          {/* ===========================================================
              🔸 Garis Data - Conditional Rendering
              =========================================================== */}
          {isDetailMode ? (
            // MODE DETAIL: Tampilkan 3 garis percepatan
            <>
              {/*  PERBAIKAN: Ganti dataKey ke 'x'  */}
              <Line
                type="monotone"
                dataKey="x" 
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
                name="Sumbu X"
                animationDuration={800}
                connectNulls
              />
              {/*  PERBAIKAN: Ganti dataKey ke 'y'  */}
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                name="Sumbu Y"
                animationDuration={800}
                connectNulls
              />
              {/*  PERBAIKAN: Ganti dataKey ke 'z'  */}
              <Line
                type="monotone"
                dataKey="z"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                name="Sumbu Z"
                animationDuration={800}
                connectNulls
              />
            </>
          ) : (
            // MODE NORMAL: Tampilkan 1 garis tingkat aktivitas
            <>
              {/*  PERBAIKAN: Ganti dataKey ke 'magnitude'  */}
              <Line
                type="monotone"
                dataKey="magnitude"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff" }}
                name="Tingkat Aktivitas"
                animationDuration={800}
                connectNulls
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ===========================================================
          🔸 Informasi tambahan di bawah grafik
          =========================================================== */}
      {isDetailMode && (
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center">
              <span className="w-4 h-0.5 bg-red-500 mr-2"></span>
              X: Maju/Mundur
            </span>
            <span className="inline-flex items-center">
              <span className="w-4 h-0.5 bg-blue-500 mr-2"></span>
              Y: Kiri/Kanan
            </span>
            <span className="inline-flex items-center">
              <span className="w-4 h-0.5 bg-green-500 mr-2"></span>
              Z: Atas/Bawah
            </span>
          </div>
          <span className="text-gray-500">
            Accelerometer 3-Axis
          </span>
        </div>
      )}
    </div>
  );
};

export default LineChartGerakan;