
import React from 'react';
import { categorizeMovement, getCategoryStyles } from '../utils/MovementUtils';
import { CowIcon } from '../GerakanPageComponents';

const HistoryCard = ({ filteredHistory, displayedData, dataOffset, getTimePeriodLabel }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">History Realtime</h2>
          <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <div className="max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            {displayedData.map((h, i) => {
              const category = categorizeMovement(h.movement);
              const actualIndex = dataOffset + i + 1;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <span className="text-sm font-bold text-gray-500 w-12">#{actualIndex}</span>
                  <span className="text-sm font-medium text-gray-600 w-24">{h.time}</span>
                  <span className="text-lg font-bold text-gray-800">
                    {h.movement !== null && h.movement !== undefined
                      ? h.movement.toFixed(1)
                      : "--"}
                  </span>
                  <div className="w-[120px] flex justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(category.color)} border`}>
                      {category.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CowIcon />
          <p className="text-gray-600 font-medium mt-4">Belum ada data riwayat gerakan</p>
          <p className="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah sensor aktif</p>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
