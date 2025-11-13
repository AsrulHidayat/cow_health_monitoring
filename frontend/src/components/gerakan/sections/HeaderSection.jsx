import React from 'react';
import { Dropdown } from '../GerakanPageComponents';

const HeaderSection = ({
  cows,
  cowId,
  onCowChange,
  avgCategory,
  selectedCow,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  getCowCondition,
  getCowConditionStyle,
  getCategoryStyles
}) => {
  if (!cows || cows.length === 0) return null;

  return (
    // Gunakan flex-wrap agar layout menyesuaikan di layar kecil
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-6 py-4 bg-white border-b border-gray-100 gap-y-4">
      
      {/* Bagian kiri: dropdown dan informasi sapi */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-start">
        {/* Dropdown sapi */}
        <Dropdown
          value={cowId}
          onChange={(val) => onCowChange(Number(val))}
          options={cows.map((c) => ({ id: c.id, name: c.tag }))}
        />

        {/* Kategori rata-rata */}
        {avgCategory && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-600 font-medium">Rata-rata:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryStyles(avgCategory.color)}`}>
              {avgCategory.label}
            </span>
          </div>
        )}

        {/* Status pemeriksaan */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Status:</span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${
              selectedCow?.checkupStatus === 'Telah diperiksa'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}
          >
            {selectedCow?.checkupStatus || 'Belum diperiksa'}
          </span>
        </div>

        {/* Kondisi sapi */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Kondisi:</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${getCowConditionStyle()}`}>
            {getCowCondition()}
          </span>
        </div>
      </div>

      {/* Bagian kanan: tombol aksi */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        {/* Tombol Edit */}
        <button
          onClick={onEditClick}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all"
        >
          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414
              a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Edit Pemeriksaan</span>
        </button>

        {/* Tombol Hapus */}
        <button
          onClick={onDeleteClick}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all"
        >
          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
              a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
              m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Hapus ID Sapi</span>
        </button>

        {/* Tombol Restore */}
        <button
          onClick={onRestoreClick}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition-all"
        >
          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9
              m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Restore Sapi</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
