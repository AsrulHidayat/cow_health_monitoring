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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Data Suhu</h2>
          <p className="text-sm text-gray-600 mb-2">
            Anda akan menghapus <span className="font-bold">SEMUA</span> data suhu untuk:
          </p>
          <p className="text-lg font-bold text-red-600 mb-4">
            {selectedCow?.tag}
          </p>
          <p className="text-xs text-gray-500 mb-6">
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