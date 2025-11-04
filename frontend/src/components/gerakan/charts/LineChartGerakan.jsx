// ============================================================
// 🔹 Komponen: LineChartGerakan (Versi Dual Mode)
// 🔹 Fungsi:
//    - Mode Normal: tampilkan 1 garis "Tingkat Aktivitas"
//    - Mode Detail: tampilkan 3 garis percepatan (X/Y/Z)
// ============================================================

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
  const activityCategory = categorizeActivity(latest.activity);
  const badgeStyle = getCategoryStyles(activityCategory.color);

  // === Konversi nilai string → number (jaga-jaga backend kirim string) ===
  const cleanData = data.map((d) => ({
    ...d,
    accel_x: Number(d.accel_x),
    accel_y: Number(d.accel_y),
    accel_z: Number(d.accel_z),
    activity: Number(d.activity),
  }));

  // === Custom Tooltip untuk format yang lebih baik ===
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {label ? label.split("T")[1]?.slice(0, 8) || label : ""}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span>{" "}
            {isDetailMode
              ? `${entry.value?.toFixed(3)} m/s²`
              : entry.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[400px]">
      {/* ===========================================================
          🔸 Header Controls - Mode Toggle & Badge
          =========================================================== */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
        {/* Toggle Button dengan indikator mode aktif */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDetailMode(!isDetailMode)}
            className={`text-xs px-3 py-1.5 rounded-md shadow-sm transition-all ${
              isDetailMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            }`}
          >
            {isDetailMode ? "📊 Mode Detail XYZ" : "📈 Mode Normal"}
          </button>
          
          {/* Label Mode */}
          <span className="text-xs text-gray-500">
            {isDetailMode 
              ? "Menampilkan percepatan 3 sumbu" 
              : "Menampilkan tingkat aktivitas"}
          </span>
        </div>

        {/* Badge Kategori Aktivitas */}
        <div
          className={`px-3 py-1 text-sm font-medium border rounded-full ${badgeStyle}`}
        >
          {activityCategory.label}
        </div>
      </div>

      {/* ===========================================================
          🔸 Grafik Utama
          =========================================================== */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={cleanData}
          margin={{ top: 40, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            opacity={0.5}
          />

          {/* Sumbu X - Waktu */}
          <XAxis
            dataKey="created_at"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) =>
              v ? v.split("T")[1]?.slice(0, 8) || v : ""
            }
            stroke="#6b7280"
            label={{
              value: "Waktu",
              position: "insideBottomRight",
              offset: -10,
              style: { fontSize: 12, fill: "#374151" }
            }}
          />

          {/* Sumbu Y - Dinamis berdasarkan mode */}
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            label={{
              value: isDetailMode
                ? "Percepatan (m/s²)"
                : "Tingkat Aktivitas",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#374151" }
            }}
            domain={isDetailMode 
              ? ["dataMin - 0.5", "dataMax + 0.5"]
              : ["dataMin - 1", "dataMax + 1"]
            }
          />

          {/* Tooltip Custom */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend - hanya tampil di mode detail */}
          {isDetailMode && (
            <Legend 
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px"
              }}
              iconType="line"
            />
          )}

          {/* ===========================================================
              🔸 Garis Data - Conditional Rendering
              =========================================================== */}
          {isDetailMode ? (
            // MODE DETAIL: Tampilkan 3 garis percepatan
            <>
              <Line
                type="monotone"
                dataKey="accel_x"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#ef4444" }}
                name="Sumbu X"
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="accel_y"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#3b82f6" }}
                name="Sumbu Y"
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="accel_z"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#10b981" }}
                name="Sumbu Z"
                animationDuration={500}
              />
            </>
          ) : (
            // MODE NORMAL: Tampilkan 1 garis tingkat aktivitas
            <Line
              type="monotone"
              dataKey="activity"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#8b5cf6" }}
              name="Tingkat Aktivitas"
              animationDuration={500}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ===========================================================
          🔸 Informasi tambahan di bawah grafik (opsional)
          =========================================================== */}
      {isDetailMode && (
        <div className="absolute bottom-2 left-4 text-xs text-gray-500">
          <span className="inline-flex items-center">
            <span className="w-3 h-0.5 bg-red-500 mr-1"></span>X: Maju/Mundur
            <span className="w-3 h-0.5 bg-blue-500 ml-3 mr-1"></span>Y: Kiri/Kanan
            <span className="w-3 h-0.5 bg-green-500 ml-3 mr-1"></span>Z: Atas/Bawah
          </span>
        </div>
      )}
    </div>
  );
};

export default LineChartGerakan;