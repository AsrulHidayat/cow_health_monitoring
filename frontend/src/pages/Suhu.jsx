import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import ChartRealtime from "../components/ChartRealtime";

import { getHistory, getAverage, getSensorStatus } from "../services/temperatureService";
import SensorStatus from "../components/SensorStatus";

const categorizeTemperature = (temp) => {
  if (temp < 36.5) return "Hipotermia";
  if (temp >= 36.5 && temp <= 39) return "Normal";
  if (temp > 39 && temp <= 40) return "Demam Ringan";
  if (temp > 40 && temp <= 41) return "Demam Tinggi";
  return "Kritis";
};

export default function Suhu() {
  const [cowId, setCowId] = useState(1);
  const [history, setHistory] = useState([]);
  const [avgData, setAvgData] = useState({ avg_temp: null });
  // Kita dapatkan status dari API, jadi defaultnya bisa 'checking...'
  const [sensorStatus, setSensorStatus] = useState("checking");

  useEffect(() => {
    //  fungsi polling 
    const pollData = async () => {
      try {
        // cek status sensor terlebih dahulu
        const statusResult = await getSensorStatus(cowId);
        setSensorStatus(statusResult.status); 
        // JIKA sensor offline, bersihkan data dan jangan lanjutkan
        if (statusResult.status !== 'online') {
          setHistory([]);
          setAvgData({ avg_temp: null });
          return;
        }
        
        // JIKA online, ambil data history dan average
        const hist = await getHistory(cowId, 20);
        const avg = await getAverage(cowId, 60);

        const formatted = hist.map((h) => ({
          time: new Date(h.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          temperature: h.temperature,
        }));

        setHistory(formatted.reverse());
        setAvgData(avg && avg.avg_temp ? avg : { avg_temp: null });

      } catch (err) {
        console.error("Gagal melakukan polling data:", err);
        setSensorStatus("offline"); // Jika ada error apapun, anggap offline
        setHistory([]);
        setAvgData({ avg_temp: null });
      }
    };

    pollData(); // Panggil segera saat cowId berubah
    const interval = setInterval(pollData, 5000); // Ulangi setiap 5 detik

    return () => clearInterval(interval); // Jangan lupa cleanup
  }, [cowId]);

  return (
    <div className="flex flex-col w-full">
      <Navbar title="Suhu" />

      {/* Dropdown & Status Marker */}
      <div className="flex items-center gap-6 px-6 py-4">
        <Dropdown
          value={cowId}
          onChange={(val) => setCowId(Number(val))}
          options={[
            { id: 1, name: "Sapi 1" },
            { id: 2, name: "Sapi 2" },
          ]}
        />
      </div>

      {/* Sensor Status */}
      <SensorStatus sensorStatus={sensorStatus} />

      {/* Chart Realtime */}
      <div className="px-6 py-4">
        {history.length > 0 ? (
          <ChartRealtime data={history} />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            {sensorStatus === 'online' ? 'Menunggu data...' : 'Belum ada data riwayat'}
          </div>
        )}
      </div>

      {/* Average & History Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
        {/* Average Suhu */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Rata-rata Suhu</h2>
          {avgData.avg_temp ? (
            <p className="text-2xl font-bold">
              {avgData.avg_temp.toFixed(2)}°C
              <span className="ml-2 text-green-600">
                ({categorizeTemperature(avgData.avg_temp)})
              </span>
            </p>
          ) : (
            <p className="flex justify-start py-10 text-gray-400">
              Belum ada data
            </p>
          )}
        </div>

        {/* History */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">History Realtime</h2>
          <ul className="max-h-64 overflow-y-auto">
            {history.length > 0 ? (
              history.map((h, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{h.time}</span>
                  <span>{h.temperature}°C</span>
                  <span>{categorizeTemperature(h.temperature)}</span>
                </li>
              ))
            ) : (
              <li className="flex justify-start py-10 text-gray-400">
                Belum ada data riwayat
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
