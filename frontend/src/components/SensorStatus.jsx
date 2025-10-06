import { Wifi, WifiOff, Loader2 } from "lucide-react";

export default function SensorStatus({ sensorStatus }) {
  // Saat sensor offline
  if (sensorStatus === "offline") {
    return (
      <div className="w-full shadow-lg rounded-2xl p-6 text-center bg-gradient-to-r from-red-100 to-red-50 border border-red-300 text-red-700 transition-all duration-500">
        <div className="flex items-center justify-center space-x-2">
          <WifiOff className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold">Sensor Tidak Aktif</h2>
        </div>
        <p className="mt-2 text-sm">
          Tidak ada data dari sensor atau sensor dalam keadaan mati
        </p>
      </div>
    );
  }

  // Saat sensor online
  if (sensorStatus === "online") {
    return (
      <div className="w-full shadow-lg rounded-2xl p-6 text-center bg-gradient-to-r from-green-100 to-green-50 border border-green-300 text-green-700 transition-all duration-500">
        <div className="flex items-center justify-center space-x-2">
          <Wifi className="w-6 h-6 text-green-600 animate-pulse" />
          <h2 className="text-xl font-bold">Sensor Aktif</h2>
        </div>
        <p className="mt-2 text-sm">
          Sensor bekerja dengan baik dan mengirim data secara realtime
        </p>
      </div>
    );
  }

  // Default: loading state
  return (
    <div className="w-full shadow-lg rounded-2xl p-12 my-6 text-center bg-gray-50 border border-gray-200 text-gray-500">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <h2 className="text-lg font-semibold">Memuat status sensor...</h2>
      </div>
      <p className="mt-2 text-sm text-gray-400">Harap tunggu sebentar</p>
    </div>
  );
}
