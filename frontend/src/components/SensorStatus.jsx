import { useEffect, useState } from "react";
import { getSensorStatus } from "../services/temperatureService";

export default function SensorStatus({ cowId }) {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSensorStatus(cowId);
        setSensorData(data);
      } catch (err) {
        console.error("Gagal ambil status sensor:", err);
        setSensorData({
          status: "offline",
          message: "Gagal cek status sensor",
        });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // cek tiap 5 detik
    return () => clearInterval(interval);
  }, [cowId]);

  // Saat loading
  if (!sensorData) {
    return (
      <div className="w-full m-4 shadow rounded-xl bg-white p-6 text-center text-gray-500">
        Memuat status sensor...
      </div>
    );
  }

  // Saat sensor offline
  if (sensorData.status === "offline") {
    return (
      <div className="w-full m-4 shadow rounded-xl p-6 text-center bg-red-50 text-red-700">
        <h2 className="text-xl font-bold">⚠ Sensor Tidak Aktif</h2>
        <p className="mt-2">{sensorData.message}</p>
      </div>
    );
  }

  // Saat sensor online
  if (sensorData.status === "online") {
    return (
      <div className="w-full m-4 shadow rounded-xl p-6 text-center bg-green-50 text-green-700">
        <h2 className="text-xl font-bold">✅ Sensor Aktif</h2>
        <p className="mt-2">{sensorData.message}</p>
      </div>
    );
  }

  return null;
}
