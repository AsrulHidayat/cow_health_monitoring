import { LogOut, XCircle } from "lucide-react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeIn">
        <div className="flex flex-col items-center text-center gap-3">
          <XCircle className="text-red-500 w-12 h-12" />
          <h2 className="text-lg font-semibold text-gray-800">
            Keluar dari Aplikasi?
          </h2>
          <p className="text-sm text-gray-500">
            Anda yakin ingin keluar dari akun ini?
          </p>

          <div className="flex gap-3 mt-5 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
