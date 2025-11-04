import React, { useState } from 'react';

export default function ActivityDistribution({ percentages }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      key: 'berbaring',
      label: 'Berbaring',
      color: '#3B82F6',
      bgColor: 'bg-blue-500',
      description: 'Sapi dalam kondisi istirahat atau tidur.',
      percentage: percentages.berbaring
    },
    {
      key: 'berdiri',
      label: 'Berdiri',
      color: '#22C55E',
      bgColor: 'bg-green-500',
      description: 'Sapi dalam kondisi sadar namun tidak aktif bergerak.',
      percentage: percentages.berdiri
    },
    {
      key: 'berjalan',
      label: 'Berjalan',
      color: '#EAB308',
      bgColor: 'bg-yellow-500',
      description: 'Sapi aktif bergerak atau berjalan.',
      percentage: percentages.berjalan
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