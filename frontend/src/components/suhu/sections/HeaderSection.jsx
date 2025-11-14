// Import komponen Dropdown dari folder SuhuPageComponents
import { Dropdown } from '../SuhuPageComponents';

// Komponen HeaderSection menerima beberapa props dari parent
const HeaderSection = ({
  cows,                   // Daftar semua sapi
  cowId,                  // ID sapi yang sedang dipilih
  onCowChange,            // Fungsi saat sapi dipilih dari dropdown
  avgCategory,            // Kategori rata-rata data (misal suhu rata-rata)
  selectedCow,            // Data sapi yang sedang dipilih
  onEditClick,            // Fungsi tombol edit pemeriksaan
  onDeleteClick,          // Fungsi tombol hapus sapi
  onRestoreClick,         // Fungsi tombol restore sapi
  getCowCondition,        // Fungsi ambil kondisi sapi
  getCowConditionStyle,   // Fungsi ambil style kondisi sapi
  getCategoryStyles       // Fungsi ambil style kategori rata-rata
}) => {

  if (!cows || cows.length === 0) return null;

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-6 py-4 bg-white border-b border-gray-200 gap-y-4">

      {/* Bagian kiri header */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-start">

        {/* Dropdown untuk memilih sapi */}
        <Dropdown
          value={cowId}
          onChange={(val) => onCowChange(Number(val))}
          options={cows.map((c) => ({ id: c.id, name: c.tag }))}
        />

        {/* Menampilkan kategori rata-rata */}
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
          <span className={`text-xs font-bold px-2 py-1 rounded ${selectedCow?.checkupStatus === 'Sudah diperiksa'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
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

      {/* Bagian kanan header (tombol aksi) */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">

        {/* Tombol edit pemeriksaan */}
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all"
          title="Edit Pemeriksaan"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Edit Pemeriksaan</span>
        </button>

        {/* Tombol hapus ID sapi */}
        <button
          onClick={onDeleteClick}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all"
          title="Hapus ID Sapi"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Hapus ID Sapi</span>
        </button>

        {/* Tombol restore sapi */}
        <button
          onClick={onRestoreClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition-all"
          title="Restore Sapi"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Restore Sapi</span>
        </button>
      </div>
    </div>
  );
};

// Ekspor komponen agar bisa digunakan di file lain
export default HeaderSection;
