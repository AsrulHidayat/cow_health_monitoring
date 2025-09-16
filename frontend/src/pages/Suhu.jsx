import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import ChartRealtime from "../components/ChartRealtime";
import { getHistory, getAverage } from "../services/temperatureService";

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

  useEffect(() => {
    const fetchData = async () => {
      const hist = await getHistory(cowId, 20);
      const avg = await getAverage(cowId, 60);

      // format history untuk chart
      const formatted = hist.map((h) => ({
        time: new Date(h.created_at).toLocaleTimeString(),
        temperature: h.temperature,
      }));

      setHistory(formatted.reverse()); // urut dari lama → baru
      setAvgData(avg);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // update tiap 5 detik
    return () => clearInterval(interval);
  }, [cowId]);

  return (
    <div className="flex flex-col w-full">
      {/* Baris 1: Judul */}
      <Navbar title="Suhu" />

      {/* Baris 2: Dropdown + marker status */}
      <div className="flex items-center gap-6 px-6 py-4 bg-gray-50">
        <Dropdown
          value={cowId}
          onChange={(val) => setCowId(Number(val))}
          options={[
            { id: 1, name: "Sapi 1" },
            { id: 2, name: "Sapi 2" },
          ]}
        />

        <div className="flex gap-4">
          <span className="px-3 py-1 bg-green-200 rounded-lg text-sm">Normal</span>
          <span className="px-3 py-1 bg-yellow-200 rounded-lg text-sm">Belum diperiksa</span>
          <span className="px-3 py-1 bg-blue-200 rounded-lg text-sm">Baik-baik saja</span>
        </div>
      </div>

      {/* Baris 3: Chart realtime */}
      <div className="px-6 py-4">
        <ChartRealtime data={history} />
      </div>

      {/* Baris 4: 2 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
        {/* Kolom kiri: Average */}
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
            <p className="text-gray-400">Belum ada data</p>
          )}
        </div>

        {/* Kolom kanan: History */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">History Realtime</h2>
          <ul className="max-h-64 overflow-y-auto">
            {history.map((h, i) => (
              <li key={i} className="flex justify-between border-b py-2 text-sm">
                <span>{h.time}</span>
                <span>{h.temperature}°C</span>
                <span>{categorizeTemperature(h.temperature)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
