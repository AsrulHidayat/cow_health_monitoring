export default function SensorStatus({ sensorStatus }) {
  // Saat sensor offline
  if (sensorStatus === "offline") {
    return (
      <div className="w-full m-4 shadow rounded-xl p-6 text-center bg-red-50 text-red-700">
        <h2 className="text-xl font-bold">⚠ Sensor Tidak Aktif</h2>
        <p className="mt-2">Tidak ada data dari sensor atau sensor dalam keadaan mati</p>
      </div>
    );
  }

  // Saat sensor online
  if (sensorStatus === "online") {
    return (
      <div className="w-full m-4 shadow rounded-xl p-6 text-center bg-green-50 text-green-700">
        <h2 className="text-xl font-bold">✅ Sensor Aktif</h2>
        <p className="mt-2">Sensor bekerja dengan baik dan mengirim data secara realtime</p>
      </div>
    );
  }

  // Default: loading state
  return (
    <div className="w-full m-4 shadow rounded-xl bg-white p-6 text-center text-gray-500">
      Memuat status sensor...
    </div>
  );
}