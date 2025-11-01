import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LineChartGerakan = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="created_at"
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => val?.split("T")[1]?.slice(0, 8)} // tampilkan jam
          label={{ value: "Waktu", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          label={{ value: "Percepatan (m/s²)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="accel_x"
          stroke="#ef4444"
          name="Sumbu X"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="accel_y"
          stroke="#3b82f6"
          name="Sumbu Y"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="accel_z"
          stroke="#22c55e"
          name="Sumbu Z"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartGerakan;
