export default function EditCheckupModal({ show, onClose, onConfirm, selectedCow }) {
  if (!show) {
    return null;
  }

  // Hitung berapa hari tersisa jika status "Sudah diperiksa"
  const getDaysRemaining = () => {
    if (!selectedCow?.checkupDate || selectedCow?.checkupStatus !== 'Sudah diperiksa') {
      return null;
    }

    const checkupDate = new Date(selectedCow.checkupDate);
    const oneWeekLater = new Date(checkupDate);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    const today = new Date();
    const daysRemaining = Math.ceil((oneWeekLater - today) / (1000 * 60 * 60 * 24));
    
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const daysRemaining = getDaysRemaining();
  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <h2 className="text-lg font-bold text-gray-800">Edit Status Pemeriksaan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pilih status pemeriksaan untuk sapi <span className="font-bold">{selectedCow?.tag}</span>
          </p>

          {/* Info status saat ini */}
          {selectedCow?.checkupStatus === 'Sudah diperiksa' && daysRemaining !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-blue-800">Status Pemeriksaan Aktif</span>
              </div>
              <p className="text-xs text-blue-700 pl-6">
                {daysRemaining > 0 
                  ? `Akan otomatis direset dalam ${daysRemaining} hari` 
                  : 'Status akan segera direset otomatis'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => onConfirm('Sudah diperiksa')}
              className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-700">Sudah diperiksa</p>
                  <p className="text-xs text-green-600">Berlaku selama 7 hari</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => onConfirm('Belum diperiksa')}
              className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-yellow-700">Belum Diperiksa</p>
                  <p className="text-xs text-yellow-600">Reset status pemeriksaan</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}