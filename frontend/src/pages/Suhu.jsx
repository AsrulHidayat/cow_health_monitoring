import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import ChartRealtime from "../components/ChartRealtime";
import { getHistory, getAverage } from "../services/temperatureService";
import SensorStatus from "../components/SensorStatus";

// Kategori kondisi suhu sapi
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
  const [sensorStatus, setSensorStatus] = useState("offline"); // default offline

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hist = await getHistory(cowId, 20);
        const avg = await getAverage(cowId, 60);

        if (!hist || hist.length === 0) {
          setHistory([]);
          setAvgData({ avg_temp: null });
          setSensorStatus("offline"); // kalau tidak ada data = offline
          return;
        }

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
        setSensorStatus("online"); // ada data = online
      } catch (err) {
        console.error("Gagal ambil data:", err);
        setHistory([]);
        setAvgData({ avg_temp: null });
        setSensorStatus("offline");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [cowId]);

  return (
    <div className="flex flex-col w-full">
      <Navbar title="Suhu" />

      {/* Dropdown & Status Marker */}
      <div className="flex items-center gap-6 px-6 py-4 bg-gray-50">
        <Dropdown
          value={cowId}
          onChange={(val) => setCowId(Number(val))}
          options={[
            { id: 1, name: "Sapi 1" },
            { id: 2, name: "Sapi 2" },
          ]}
        />

        {/* Badge status hanya muncul kalau sensor online */}
        {sensorStatus === "online" && (
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-green-200 rounded-lg text-sm">
              Normal
            </span>
            <span className="px-3 py-1 bg-yellow-200 rounded-lg text-sm">
              Belum diperiksa
            </span>
            <span className="px-3 py-1 bg-blue-200 rounded-lg text-sm">
              Baik-baik saja
            </span>
          </div>
        )}
      </div>

      {/* Sensor Status */}
      <SensorStatus sensorStatus={sensorStatus} />

      {/* Chart Realtime */}
      <div className="px-6 py-4">
        {history.length > 0 ? (
          <ChartRealtime data={history} />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            Belum ada data riwayat
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
