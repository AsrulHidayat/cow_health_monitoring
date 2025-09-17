import { useEffect, useState } from "react";
import { getSensorStatus } from "../services/temperatureService";

export default function SensorStatus({ cowId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSensorStatus(cowId);
        setStatus(data);
      } catch (err) {
        console.error("Gagal ambil status sensor:", err);
        setStatus({ status: "offline", message: "Gagal cek status sensor" });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // cek tiap 5 detik
    return () => clearInterval(interval);
  }, [cowId]);

  if (!status) {
    return (
      <div className="w-full flex justify-center py-6 text-gray-500">
        Memuat status sensor...
      </div>
    );
  }

  if (status.status === "offline") {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-red-50 text-red-700 rounded-xl shadow p-6 m-4">
        <h2 className="text-xl font-bold">⚠ Sensor Tidak Aktif</h2>
        <p className="mt-2">{status.message}</p>
      </div>
    );
  }

  if (status.status === "online") {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-green-50 text-green-700 rounded-xl shadow p-6 m-4">
        <h2 className="text-xl font-bold">✅ Sensor Aktif</h2>
        <p className="mt-2">{status.message}</p>
      </div>
    );
  }

  return null;
}
