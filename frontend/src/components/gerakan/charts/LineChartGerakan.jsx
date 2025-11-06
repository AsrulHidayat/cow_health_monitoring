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
  const latest = data[data.length - 1];
  const activityCategory = categorizeActivity(latest.x, latest.y, latest.z);
  const badgeStyle = getCategoryStyles(activityCategory.color);

  // === Transformasi data (menambah 'activityLabel', 'timeLabel', dll.) ===
  const cleanData = data.map((d, index) => {
    const magnitude = d.magnitude != null ? Number(d.magnitude) : null;
    const x = d.x != null ? Number(d.x) : null;
    const y = d.y != null ? Number(d.y) : null;
    const z = d.z != null ? Number(d.z) : null;

    // ✅ Klasifikasi berdasarkan X, Y, Z (bukan magnitude)
    const categoryInfo = categorizeActivity(x, y, z);

    return {
      ...d,
      index: index + 1,
      magnitude: magnitude,
      x: x,
      y: y,
      z: z,
      activityLabel: categoryInfo.label, // Untuk Sumbu Y Mode Normal
      activityValue: categoryInfo.value, // Untuk filtering
      activityColor: categoryInfo.color, // Untuk warna
      timeLabel: d.time || new Date(d.fullDate).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: new Date(d.fullDate).getTime()
    };
  }).sort((a, b) => b.timestamp - a.timestamp); // Urutkan data kiri ke kanan berdasarkan waktu

  // === Custom Tooltip untuk format yang lebih baik ===
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const dataPoint = payload[0].payload;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
          {label || "N/A"}
        </p>
        <div className="space-y-2">
          {isDetailMode ? (
            // === Tooltip untuk MODE DETAIL (x,y,z) ===
            payload.map((entry, index) => {
              if (entry.value == null) return null; // Pengecekan null sudah ada
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
                    {entry.value.toFixed(3)} m/s²
                  </span>
                </div>
              );
            })
          ) : (
            // === Tooltip untuk MODE NORMAL (Kategorikal) ===
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Aktivitas:
                  </span>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {dataPoint.activityLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Nilai (Mag):
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {/* ========================================================
                       PERBAIKAN: Tambahkan pengecekan 'null' di sini 
                      ======================================================== */}
                  {dataPoint.magnitude != null ? dataPoint.magnitude.toFixed(2) : 'N/A'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // === Custom Dot untuk mode normal (masih menggunakan magnitude untuk warna) ===
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return null;

    const fillColor = payload.activityColor || '#8B5CF6';

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

  const normalModeData = cleanData.slice(-100);
  const chartData = isDetailMode ? cleanData : normalModeData;

  return (
    <div className="relative w-full h-[400px]">
      {/* ===========================================================
          🔸 Header Controls - Mode Toggle & Badge
          =========================================================== */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">

        {/* === Bagian Kiri: Label & Info Data === */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {isDetailMode
              ? "Menampilkan percepatan 3 sumbu"
              : "Menampilkan kategori aktivitas"}
          </span>
          <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {chartData.length} data point
          </span>
        </div>

        {/* === Bagian Kanan: Badge & Tombol Toggle === */}
        <div className="flex items-center gap-3">
          {/* Badge Kategori Aktivitas (hanya untuk mode normal) */}
          {!isDetailMode && (
            <div
              className={`px-4 py-2 text-sm font-semibold border rounded-xl shadow-md ${badgeStyle}`}
            >
              {activityCategory.label}
            </div>
          )}

          {/* Tombol Toggle Button */}
          <button
            onClick={() => setIsDetailMode(!isDetailMode)}
            className={`text-xs px-4 py-2 rounded-lg shadow-md transition-all font-medium ${isDetailMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
          >
            {isDetailMode ? "Mode Detail XYZ" : "Mode Normal"}
          </button>
        </div>
      </div>

      {/* ===========================================================
          🔸 Grafik Utama (Conditional)
          =========================================================== */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 60, right: 40, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            opacity={0.5}
            vertical={false}
          />

          {/* Sumbu X - Waktu (Sama untuk kedua mode) */}
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
          {isDetailMode ? (
            // Sumbu Y untuk MODE DETAIL (Numerik)
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              label={{
                value: "Percepatan (m/s²)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: '#374151', fontWeight: 600 }
              }}
              domain={['auto', 'auto']}
            />
          ) : (
            // Sumbu Y untuk MODE NORMAL (Kategorikal)
            <YAxis
              type="category"
              dataKey="activityLabel"
              domain={['N/A', 'Berbaring Kiri', 'Berbaring Kanan', 'Berdiri']}
              tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              label={{
                value: "Aktivitas",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: '#374151', fontWeight: 600 }
              }}
            />
          )}

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

          {/* Garis Data - Conditional Rendering */}
          {isDetailMode ? (
            // MODE DETAIL: Tampilkan 3 garis percepatan (x,y,z)
            <>
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
            // MODE NORMAL: Tampilkan 1 garis kategori (activityLabel)
            <>
              <Line
                type="step" // 'step' agar garis "melompat" antar kategori
                dataKey="activityLabel" // Gunakan dataKey label
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={<CustomDot />} // Dot tetap berwarna berdasarkan magnitude
                activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff" }}
                name="Aktivitas"
                animationDuration={800}
                connectNulls
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ===========================================================
          🔸 Informasi tambahan di bawah grafik (hanya untuk Mode Detail)
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