export default function DeleteModal({ show, onClose, onConfirm, selectedCow }) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus ID Sapi</h2>
          <p className="text-sm text-gray-600 mb-2">
            Anda akan menghapus ID sapi <span className="font-bold text-red-600">{selectedCow?.tag}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Beserta <span className="font-bold">SEMUA data monitoring</span> yang terkait:
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 w-full">
            <ul className="text-xs text-left text-red-700 space-y-1">
              <li>• Data suhu</li>
              <li>• Data detak jantung</li>
              <li>• Data aktivitas</li>
              <li>• Riwayat pemeriksaan</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 w-full">
            <p className="text-xs text-blue-700 leading-relaxed">
              ℹ️ Data akan di-backup dan bisa dipulihkan oleh admin jika diperlukan
            </p>
          </div>

          <p className="text-xs text-gray-500 mb-6 font-medium">
            ⚠️ Tindakan ini tidak dapat dibatalkan!
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}