import React from 'react';
import { categorizeActivity, getCategoryStyles } from '../utils/activityUtils';
import { CowIcon } from '../GerakanPageComponents';

const AverageCard = ({ filteredHistory, avgData, displayedData, getTimePeriodLabel }) => {
  const avgCategory = avgData.avg_activity ? categorizeActivity(avgData.avg_activity) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rata-rata Gerakan</h2>
          <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
        </div>
      </div>

      {filteredHistory.length > 0 && avgData.avg_activity ? (
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="text-6xl font-bold text-gray-800 mb-3">
              {avgData.avg_activity.toFixed(1)}
              <span className="text-3xl text-gray-500"></span>
            </div>
            {avgCategory && (
              <div className="absolute -top-2 -right-12">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(avgCategory.color)} border`}>
                  {avgCategory.label}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              {avgCategory && (
                <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getCategoryStyles(avgCategory.color)}`}>
                  {avgCategory.label}
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Sampel Data</p>
              <p className="text-2xl font-bold text-gray-800">{displayedData.length}</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CowIcon />
          <p className="text-gray-600 font-medium mt-4">Belum ada data rata-rata gerakan</p>
          <p className="text-sm text-gray-400 mt-1">Menunggu data dari sensor...</p>
        </div>
      )}
    </div>
  );
};

export default AverageCard;