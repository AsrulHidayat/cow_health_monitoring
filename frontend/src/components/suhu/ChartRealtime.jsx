import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ChartRealtime({ data }) {
  const categorizeTemp = (temp) => {
    if (temp < 37.5) return "Hipotermia";
    if (temp >= 37.5 && temp <= 39.5) return "Normal";
    if (temp > 39.5 && temp <= 40.5) return "Demam Ringan";
    if (temp > 40.5 && temp <= 41.5) return "Demam Tinggi";
    return "Kritis";
  };

  const getBarColor = (temp) => {
    if (temp < 37.5) return "#3B82F6";
    if (temp >= 37.5 && temp <= 39.5) return "#22C55E";
    if (temp > 39.5 && temp <= 40.5) return "#EAB308";
    if (temp > 40.5 && temp <= 41.5) return "#F97316";
    return "#EF4444";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const temp = payload[0].value;
      const category = categorizeTemp(temp);

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-base font-bold text-gray-800 mb-1">
            {temp.toFixed(1)}°C - {category}
          </p>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <p className="text-sm text-gray-600">
              {new Date(data.fullDate).toLocaleString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}</p>
            <p className="text-sm font-medium text-gray-700">{data.time}</p>
            {data.count && data.count > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                Rata-rata dari {data.count} data
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
          stroke="#d1d5db"
          axisLine={false}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          domain={['dataMin - 0.5', 'dataMax + 0.5']}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          stroke="#d1d5db"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value.toFixed(1)}°C`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} />
        <Bar
          dataKey="temperature"
          radius={[8, 8, 0, 0]}
          barSize={35}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry.temperature)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};