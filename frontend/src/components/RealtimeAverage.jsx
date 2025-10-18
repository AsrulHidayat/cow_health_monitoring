import React, { useEffect, useState } from 'react';

const categorizeTemperature = (temp) => {
  if (temp < 37.5) return 'hipotermia';
  if (temp >= 37.5 && temp <= 39.5) return 'normal';
  if (temp > 39.5 && temp <= 40.5) return 'demam_ringan';
  if (temp > 40.5 && temp <= 41.5) return 'demam_tinggi';
  return 'kritis';
};

const getCategoryColor = (category) => {
  const colors = {
    hipotermia: '#3B82F6', // blue
    normal: '#22C55E', // green
    demam_ringan: '#EAB308', // yellow
    demam_tinggi: '#F97316', // orange
    kritis: '#EF4444', // red
  };
  return colors[category] || '#9CA3AF';
};

const getCategoryLabel = (category) => {
  const labels = {
    hipotermia: 'Normal',
    normal: 'Normal',
    demam_ringan: 'Demam Ringan',
    demam_tinggi: 'Demam Tinggi',
    kritis: 'Kritis',
  };
  return labels[category] || 'Unknown';
};

// Simpan komponen ini sebagai: frontend/src/components/RealtimeAverage.jsx

export default function RealtimeAverage({ cowId }) {
  const [averageTemp, setAverageTemp] = useState(null);
  const [distribution, setDistribution] = useState({
    hipotermia: 0,
    normal: 0,
    demam_ringan: 0,
    demam_tinggi: 0,
    kritis: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cowId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Ambil history data untuk menghitung distribusi
        const response = await fetch(`http://localhost:5001/api/temperature/${cowId}/history?limit=100`);
        const data = await response.json();

        if (data && data.length > 0) {
          // Hitung rata-rata
          const sum = data.reduce((acc, item) => acc + item.temperature, 0);
          const avg = sum / data.length;
          setAverageTemp(avg);

          // Hitung distribusi kategori
          const dist = {
            hipotermia: 0,
            normal: 0,
            demam_ringan: 0,
            demam_tinggi: 0,
            kritis: 0,
          };

          data.forEach((item) => {
            const category = categorizeTemperature(item.temperature);
            dist[category]++;
          });

          // Konversi ke persentase
          const total = data.length;
          Object.keys(dist).forEach((key) => {
            dist[key] = Math.round((dist[key] / total) * 100);
          });

          setDistribution(dist);
        } else {
          setAverageTemp(null);
          setDistribution({
            hipotermia: 0,
            normal: 0,
            demam_ringan: 0,
            demam_tinggi: 0,
            kritis: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update setiap 5 detik

    return () => clearInterval(interval);
  }, [cowId]);

  // Hitung persentase untuk circular progress
  const getCircularProgress = () => {
    const segments = [];
    let offset = 0;

    // Urutan warna: hipotermia, normal, demam ringan, demam tinggi, kritis
    const categories = ['hipotermia', 'normal', 'demam_ringan', 'demam_tinggi', 'kritis'];
    
    categories.forEach((category) => {
      const percentage = distribution[category];
      if (percentage > 0) {
        segments.push({
          category,
          percentage,
          offset,
          color: getCategoryColor(category),
        });
        offset += percentage;
      }
    });

    return segments;
  };

  const currentCategory = averageTemp ? categorizeTemperature(averageTemp) : 'normal';
  const segments = getCircularProgress();

  // SVG circle parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
        Realtime Average
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Circular Progress */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
              
              {/* Progress segments */}
              {segments.map((segment, index) => {
                const segmentLength = (segment.percentage / 100) * circumference;
                const segmentOffset = (segment.offset / 100) * circumference;
                
                return (
                  <circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={-segmentOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {loading ? (
                <div className="text-gray-400 text-sm">Loading...</div>
              ) : averageTemp ? (
                <>
                  <div className="text-5xl font-bold text-gray-800">
                    {averageTemp.toFixed(1)}°C
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {getCategoryLabel(currentCategory)}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm text-center">
                  No Data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distribution List */}
        <div className="space-y-4">
          {/* Hipotermia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Hipotermia
                  <span className="text-xs text-gray-400 ml-1">&lt; 37,5°C</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${distribution.hipotermia}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 ml-4 min-w-[3rem] text-right">
              {distribution.hipotermia}%
            </div>
          </div>

          {/* Normal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Normal
                  <span className="text-xs text-gray-400 ml-1">37,5 - 39,5°C</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${distribution.normal}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 ml-4 min-w-[3rem] text-right">
              {distribution.normal}%
            </div>
          </div>

          {/* Demam Ringan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Demam Ringan
                  <span className="text-xs text-gray-400 ml-1">39,6 - 40,5°C</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${distribution.demam_ringan}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 ml-4 min-w-[3rem] text-right">
              {distribution.demam_ringan}%
            </div>
          </div>

          {/* Demam Tinggi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Demam Tinggi
                  <span className="text-xs text-gray-400 ml-1">40,6 - 41,5°C</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${distribution.demam_tinggi}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 ml-4 min-w-[3rem] text-right">
              {distribution.demam_tinggi}%
            </div>
          </div>

          {/* Kritis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Kritis
                  <span className="text-xs text-gray-400 ml-1">&gt; 41,5°C</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${distribution.kritis}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 ml-4 min-w-[3rem] text-right">
              {distribution.kritis}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}