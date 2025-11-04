// frontend/src/components/gerakan/charts/LineChartGerakan.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { categorizeActivity, getCategoryStyles } from "../utils/activityUtils";

const LineChartGerakan = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Tidak ada data untuk ditampilkan.
      </div>
    );
  }

  // Ambil kategori aktivitas dari data terakhir
  const latest = data[data.length - 1];
  const activityCategory = categorizeActivity(latest.activity);
  const badgeStyle = getCategoryStyles(activityCategory.color);

  return (
    <div className="relative w-full h-[400px]">
      {/* === Kategori Aktivitas di pojok kanan atas === */}
      <div
        className={`absolute top-2 right-4 px-3 py-1 text-sm font-medium border rounded-full ${badgeStyle}`}
      >
        {activityCategory.label}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            label={{
              value: "Waktu",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Percepatan (m/s²)",
              angle: -90,
              position: "insideLeft",
            }}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            formatter={(value, name) => [
              `${value.toFixed(2)} m/s²`,
              name.toUpperCase(),
            ]}
          />

          {/* === Garis percepatan X, Y, Z === */}
          <Line
            type="monotone"
            dataKey="accel_x"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="X"
          />
          <Line
            type="monotone"
            dataKey="accel_y"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Y"
          />
          <Line
            type="monotone"
            dataKey="accel_z"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name="Z"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartGerakan;
