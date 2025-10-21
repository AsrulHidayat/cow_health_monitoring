import React, { useState } from 'react';

export default function TemperatureDistribution({ history }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const calculateDistribution = () => {
    if (!history || history.length === 0) {
      return {
        hipotermia: 0,
        normal: 0,
        demamRingan: 0,
        demamTinggi: 0,
        kritis: 0
      };
    }

    const counts = {
      hipotermia: 0,
      normal: 0,
      demamRingan: 0,
      demamTinggi: 0,
      kritis: 0
    };

    history.forEach(item => {
      const temp = item.temperature;
      if (temp < 37.5) counts.hipotermia++;
      else if (temp >= 37.5 && temp <= 39.5) counts.normal++;
      else if (temp > 39.5 && temp <= 40.5) counts.demamRingan++;
      else if (temp > 40.5 && temp <= 41.5) counts.demamTinggi++;
      else counts.kritis++;
    });

    const total = history.length;
    return {
      hipotermia: Math.round((counts.hipotermia / total) * 100),
      normal: Math.round((counts.normal / total) * 100),
      demamRingan: Math.round((counts.demamRingan / total) * 100),
      demamTinggi: Math.round((counts.demamTinggi / total) * 100),
      kritis: Math.round((counts.kritis / total) * 100)
    };
  };

  const distribution = calculateDistribution();

  const categories = [
    {
      key: 'hipotermia',
      label: 'Hipotermia',
      color: '#3B82F6',
      bgColor: 'bg-blue-500',
      range: '< 37,5°C',
      description: 'Penurunan suhu tubuh akibat cuaca dingin atau gangguan metabolik',
      percentage: distribution.hipotermia
    },
    {
      key: 'normal',
      label: 'Normal',
      color: '#22C55E',
      bgColor: 'bg-green-500',
      range: '37,5 - 39,5°C',
      description: 'Kondisi fisiologis sapi yang sehat dan stabil',
      percentage: distribution.normal
    },
    {
      key: 'demamRingan',
      label: 'Demam Ringan',
      color: '#EAB308',
      bgColor: 'bg-yellow-500',
      range: '39,6 - 40,5°C',
      description: 'Respon tubuh terhadap infeksi ringan atau stres',
      percentage: distribution.demamRingan
    },
    {
      key: 'demamTinggi',
      label: 'Demam Tinggi',
      color: '#F97316',
      bgColor: 'bg-orange-500',
      range: '40,6 - 41,5°C',
      description: 'Kemungkinan infeksi serius yang memerlukan perhatian lebih',
      percentage: distribution.demamTinggi
    },
    {
      key: 'kritis',
      label: 'Kritis',
      color: '#EF4444',
      bgColor: 'bg-red-500',
      range: '> 41,5°C',
      description: 'Kondisi berbahaya yang dapat mengancam nyawa jika tidak segera ditangani',
      percentage: distribution.kritis
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-6 text-left">Distribusi Klasifikasi Suhu</h3>

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
                <span className="text-xs text-gray-500">({cat.range})</span>
              </div>
              <span className="text-lg font-bold text-gray-800">{cat.percentage}%</span>
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