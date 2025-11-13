import React from 'react';
import { getCategoryStyles } from '../utils/activityUtils';
import { CowIcon } from '../GerakanPageComponents';
import ActivityDistribution from '../ActivityDistribution';

const AverageCard = ({ filteredHistory, displayedData, getTimePeriodLabel, activityPercentages }) => {
  // ✅ Cari kategori dengan persentase tertinggi
  const getDominantCategory = () => {
    if (!activityPercentages) return null;
    
    const categories = [
      { key: 'berdiri', label: 'Berdiri', color: 'green', percentage: activityPercentages.berdiri },
      { key: 'baringKanan', label: 'Berbaring Kanan', color: 'blue', percentage: activityPercentages.baringKanan },
      { key: 'baringKiri', label: 'Berbaring Kiri', color: 'cyan', percentage: activityPercentages.baringKiri },
      { key: 'na', label: 'N/A', color: 'gray', percentage: activityPercentages.na }
    ];
    
    return categories.reduce((max, cat) => cat.percentage > max.percentage ? cat : max);
  };

  const dominantCategory = getDominantCategory();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* HEADER - Diubah Sesuai Referensi */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Rata-rata Gerakan</h2>
          <p className="text-sm text-white/90">{getTimePeriodLabel()}</p>
        </div>
      </div>

      {/* KONTEN */}
      <div className="p-6">
        {filteredHistory.length > 0 && dominantCategory ? (
          <div className="text-center pt-8"> {/* Mengubah py-8 menjadi pt-8 */}
            <div className="relative inline-block">
              <div className="text-6xl font-bold text-gray-800 mb-3">
                {dominantCategory.percentage.toFixed(1)}
                <span className="text-3xl text-gray-500">%</span>
              </div>
              <div className="absolute -top-2 -right-16">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(dominantCategory.color)} border`}>
                  {dominantCategory.label}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Status Dominan</p>
                <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getCategoryStyles(dominantCategory.color)}`}>
                  {dominantCategory.label}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Sampel Data</p>
                <p className="text-2xl font-bold text-gray-800">{displayedData.length}</p>
              </div>
            </div>

            <ActivityDistribution percentages={activityPercentages} />

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CowIcon />
            <p className="text-gray-600 font-medium mt-4">Belum ada data rata-rata gerakan</p>
            <p className="text-sm text-gray-400 mt-1">Menunggu data dari sensor...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageCard;