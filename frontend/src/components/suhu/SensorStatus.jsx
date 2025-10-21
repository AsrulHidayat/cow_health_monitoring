import React from 'react';

export default function SensorStatus({ sensorStatus }) {
  if (sensorStatus === "offline") {
    return (
      <div className="w-full shadow-md rounded-xl p-5 text-center bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h2 className="text-lg font-bold text-red-700">Sensor Tidak Aktif</h2>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Tidak ada data dari sensor atau sensor dalam keadaan mati
        </p>
      </div>
    );
  }

  if (sensorStatus === "online") {
    return (
      <div className="w-full shadow-md rounded-xl p-5 text-center bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="text-lg font-bold text-green-700">Sensor Aktif</h2>
        </div>
        <p className="mt-2 text-sm text-green-600">
          Sensor bekerja dengan baik dan mengirim data secara realtime
        </p>
      </div>
    );
  }

  return (
    <div className="w-full shadow-md rounded-xl p-5 text-center bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-lg font-semibold text-gray-600">Memuat status sensor...</h2>
      </div>
    </div>
  );
};