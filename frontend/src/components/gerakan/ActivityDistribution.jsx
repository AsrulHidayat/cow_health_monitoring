import React, { useState } from 'react';

export default function ActivityDistribution({ percentages }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      key: 'berdiri',
      label: 'Berdiri',
      color: '#22C55E',
      bgColor: 'bg-green-500',
      range: 'X: -0.9 ~ -0.2 | Y: -2.5 ~ -0.7 | Z: 11.1 ~ 11.5',
      description: 'Sapi dalam kondisi berdiri normal dan aktif.',
      percentage: percentages.berdiri || 0
    },
    {
      key: 'baringKanan',
      label: 'Berbaring Kanan',
      color: '#3B82F6',
      bgColor: 'bg-blue-500',
      range: 'X: -0.3 ~ -0.2 | Y: 5.6 ~ 5.7 | Z: ≈10.0',
      description: 'Sapi berbaring dengan posisi miring ke kanan.',
      percentage: percentages.baringKanan || 0
    },
    {
      key: 'baringKiri',
      label: 'Berbaring Kiri',
      color: '#06B6D4',
      bgColor: 'bg-cyan-500',
      range: 'X: ≈-0.3 | Y: -8.2 ~ -8.1 | Z: 7.2 ~ 7.3',
      description: 'Sapi berbaring dengan posisi miring ke kiri.',
      percentage: percentages.baringKiri || 0
    },
    {
      key: 'na',
      label: 'N/A (Tidak Normal)',
      color: '#6B7280',
      bgColor: 'bg-gray-500',
      range: 'Di luar rentang nilai normal',
      description: 'Data tidak normal atau posisi tidak teridentifikasi - Bisa jadi sapi sedang jungkir balik atau sensornya yang kebalik',
      percentage: percentages.na || 0
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-6 text-left">Distribusi Aktivitas</h3>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="relative"
            onMouseEnter={() => setHoveredCategory(cat.key)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-800">{cat.percentage.toFixed(1)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${cat.bgColor} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${cat.percentage}%` }}
              ></div>
            </div>

            {hoveredCategory === cat.key && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 animate-fadeIn">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};