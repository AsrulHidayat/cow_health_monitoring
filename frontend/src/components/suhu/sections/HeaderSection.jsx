
import React from 'react';
import { Dropdown } from '../SuhuPageComponents';

const HeaderSection = ({ 
  cows, 
  cowId, 
  onCowChange, 
  avgCategory, 
  selectedCow, 
  onEditClick, 
  onDeleteClick, 
  getCowCondition, 
  getCowConditionStyle, 
  getCategoryStyles 
}) => {
  if (!cows || cows.length === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <Dropdown
          value={cowId}
          onChange={(val) => onCowChange(Number(val))}
          options={cows.map((c) => ({ id: c.id, name: c.tag }))}
        />

        {avgCategory && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-600 font-medium">Rata-rata:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryStyles(avgCategory.color)}`}>
              {avgCategory.label}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Status:</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${selectedCow?.checkupStatus === 'Telah diperiksa'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
            {selectedCow?.checkupStatus || 'Belum diperiksa'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Kondisi:</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${getCowConditionStyle()}`}>
            {getCowCondition()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-sm font-medium">Edit Pemeriksaan</span>
        </button>

        <button
          onClick={onDeleteClick}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-sm font-medium">Hapus</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
