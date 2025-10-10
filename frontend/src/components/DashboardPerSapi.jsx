import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPerSapi({ cow }) {
  const [temperature, setTemperature] = useState([]);
  const [heartbeat, setHeartbeat] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cow) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tempRes, heartRes, actRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/temperature/${cow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5001/api/heartbeat/${cow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5001/api/activity/${cow.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTemperature(tempRes.data);
        setHeartbeat(heartRes.data);
        setActivity(actRes.data);
      } catch (error) {
        console.error("Gagal memuat data sensor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cow]);

  if (loading) return <div>🔄 Memuat data sensor...</div>;

  if (!temperature.length && !heartbeat.length && !activity.length)
    return (
      <div className="flex flex-col items-center text-gray-500">
        <p>⚠️ Sensor tidak aktif untuk {cow.tag}</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div className="p-4 bg-green-50 rounded-lg border">
        <h3 className="font-semibold mb-2">Suhu</h3>
        <p className="text-2xl font-bold text-green-700">
          {temperature[0]?.temperature ?? "--"}°C
        </p>
        <p className="text-sm text-gray-500">{temperature[0]?.status ?? "Tidak ada data"}</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg border">
        <h3 className="font-semibold mb-2">Detak Jantung</h3>
        <p className="text-2xl font-bold text-green-700">
          {heartbeat[0]?.bpm ?? "--"} bpm
        </p>
        <p className="text-sm text-gray-500">{heartbeat[0]?.status ?? "Tidak ada data"}</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg border">
        <h3 className="font-semibold mb-2">Aktivitas</h3>
        <p className="text-lg font-medium text-gray-700">
          {activity[0]?.activity ?? "Tidak ada data"}
        </p>
      </div>
    </div>
  );
}
