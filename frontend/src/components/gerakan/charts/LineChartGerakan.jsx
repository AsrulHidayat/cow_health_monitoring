import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart, // <-- Impor Grafik Batang
  Bar,      // <-- Impor Batang
  LabelList,// <-- Impor Label untuk Batang
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
  const activityCategory = categorizeActivity(latest.magnitude);
  const badgeStyle = getCategoryStyles(activityCategory.color);

  // === Transformasi data untuk Grafik Garis (Mode Detail) ===
  const lineChartData = data.map((d, index) => {
    const magnitude = d.magnitude != null ? Number(d.magnitude) : null;
    const x = d.x != null ? Number(d.x) : null;
    const y = d.y != null ? Number(d.y) : null;
    const z = d.z != null ? Number(d.z) : null;

    return {
      ...d,
      index: index + 1,
      magnitude: magnitude,
      x: x,
      y: y,
      z: z,
      timeLabel: d.time || new Date(d.fullDate).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: new Date(d.fullDate).getTime()
    };
  }).sort((a, b) => a.timestamp - b.timestamp); // Sort by time ascending

  // === Kalkulasi data untuk Grafik Batang (Mode Normal) ===
  const summaryCounts = { Berbaring: 0, Berdiri: 0, Berjalan: 0 };
  data.forEach(item => {
    // Gunakan 'magnitude' yang sudah benar dari data
    const category = categorizeActivity(item.magnitude).value;
    
    // ========================================================
    //  PERBAIKAN ESLINT 'no-prototype-builtins' ADA DI SINI 
    // ========================================================
    if (Object.prototype.hasOwnProperty.call(summaryCounts, category)) {
      summaryCounts[category]++;
    }
  });
  
  const total = data.length;
  
  const barChartData = [
    { name: 'Berbaring', Persentase: (summaryCounts.Berbaring / total) * 100 },
    { name: 'Berdiri', Persentase: (summaryCounts.Berdiri / total) * 100 },
    { name: 'Berjalan', Persentase: (summaryCounts.Berjalan / total) * 100 },
  ];
  // === Akhir Kalkulasi ===


  // === Custom Tooltip untuk Grafik Garis (Mode Detail) ===
  const CustomLineTooltip = ({ active, payload, label }) => {
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
      </div>
    );
  };

  return (
    <div className="relative w-full h-[400px]">
      {/* ===========================================================
          🔸 Header Controls - Mode Toggle & Badge
          =========================================================== */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDetailMode(!isDetailMode)}
            className={`text-xs px-4 py-2 rounded-lg shadow-md transition-all font-medium ${
              isDetailMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            {isDetailMode ? "📊 Mode Detail XYZ" : "📈 Mode Ringkasan"}
          </button>
          
          <span className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {isDetailMode 
              ? "Menampilkan percepatan 3 sumbu" 
              : "Menampilkan ringkasan aktivitas"}
          </span>

          <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            {lineChartData.length} data point
          </span>
        </div>

        {/* Badge Kategori Aktivitas (hanya untuk mode normal) */}
        {!isDetailMode && (
          <div
            className={`px-4 py-2 text-sm font-semibold border rounded-xl shadow-md ${badgeStyle}`}
          >
            Kondisi: {activityCategory.label}
          </div>
        )}
      </div>

      {/* ===========================================================
          🔸 Grafik Utama (Sekarang Conditional)
          =========================================================== */}
      {isDetailMode ? (
        // ================ MODE DETAIL (LINE CHART) ================
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={lineChartData} // Gunakan data yang sudah di-transform & sort
            margin={{ top: 60, right: 40, left: 20, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="timeLabel" // Menampilkan "10:50:30"
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
            <Tooltip content={<CustomLineTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: "15px",
                fontSize: "12px",
                fontWeight: 500
              }}
              iconType="line"
              iconSize={16}
            />
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
          </LineChart>
        </ResponsiveContainer>
      
      ) : (
        
        // ================ MODE NORMAL (BAR CHART) ================
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={barChartData} 
            margin={{ top: 80, right: 60, left: 20, bottom: 20 }} // Margin disesuaikan
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} horizontal={false} />
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false} 
              width={80}
            />
            <XAxis 
              type="number"
              domain={[0, 100]}
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(tick) => `${tick.toFixed(0)}%`} 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              label={{
                value: "Persentase Waktu",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 12, fill: '#374151', fontWeight: 600 }
              }}
            />
            <Tooltip 
              formatter={(value) => `${value.toFixed(1)}%`}
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '10px',
                border: '1px solid #e5e7eb'
              }}
            />
            <Bar dataKey="Persentase" fill="#8B5CF6" barSize={35}>
              <LabelList 
                dataKey="Persentase" 
                position="right" 
                formatter={(value) => `${value.toFixed(1)}%`} 
                style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

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