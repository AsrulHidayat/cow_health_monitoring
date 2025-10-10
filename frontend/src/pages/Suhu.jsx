import { useEffect, useState } from "react";
import { getHistory, getAverage, getSensorStatus, getAllCows } from "../services/temperatureService";

import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import ChartRealtime from "../components/ChartRealtime";
import SensorStatus from "../components/SensorStatus";
import cowIcon from "../assets/cow.png";
import plusIcon from "../assets/plus-icon.svg";

const categorizeTemperature = (temp) => {
  if (temp < 36.5) return "Hipotermia";
  if (temp >= 36.5 && temp <= 39) return "Normal";
  if (temp > 39 && temp <= 40) return "Demam Ringan";
  if (temp > 40 && temp <= 41) return "Demam Tinggi";
  return "Kritis";
};

export default function Suhu() {
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [history, setHistory] = useState([]);
  const [avgData, setAvgData] = useState({ avg_temp: null });
  const [sensorStatus, setSensorStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

  // Ambil semua sapi dari database
  useEffect(() => {
    const fetchCows = async () => {
      try {
        setLoading(true);
        const allCows = await getAllCows();
        setCows(allCows);

        if (allCows.length > 0) setCowId(allCows[0].id);
      } catch (err) {
        console.error("Gagal mengambil data sapi:", err);
        setCows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
  }, []);

  // Polling data sensor hanya jika ada cowId
  useEffect(() => {
    if (!cowId) {
      setHistory([]);
      setAvgData({ avg_temp: null });
      setSensorStatus("offline");
      return;
    }

    const pollData = async () => {
      try {
        const statusResult = await getSensorStatus(cowId);
        setSensorStatus(statusResult.status);

        if (statusResult.status !== "online") {
          setHistory([]);
          setAvgData({ avg_temp: null });
          return;
        }

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
        setSensorStatus("offline");
        setHistory([]);
        setAvgData({ avg_temp: null });
      }
    };

    pollData();
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, [cowId]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <Navbar title="Suhu" />

      {/* Dropdown hanya tampil jika ada sapi */}
      {cows.length > 0 && (
        <div className="flex items-center gap-6 px-6 py-4">
          <Dropdown
            value={cowId}
            onChange={(val) => setCowId(Number(val))}
            options={cows.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      )}

      {/* SensorStatus hanya tampil jika ada sapi */}
      {cows.length > 0 && (
        <div className="px-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      {/* Chart Realtime / Placeholder */}
      <div className="px-6 py-4">
        {/* Tombol Tambah Sapi hanya tampil jika tidak ada sapi */}
        {cows.length === 0 && !loading && (
          <div className="flex pb-6 pt-2">
            <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
              <img src={plusIcon} alt="Tambah Sapi" className="w-5 h-5" />
              <span className="text-blue-600 font-medium">Tambah Sapi</span>
            </button>
          </div>
        )}

      {/* Header Realtime Graphics */}
      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
            <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
          </div>
          <select className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition">
            <option>Per Menit</option>
            <option>Per Jam</option>
          </select>
        </div>
      </div>

      {/* Konten Grafik */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-lg py-24">
          Memuat data sapi...
        </div>
      ) : cows.length > 0 ? (
        history.length > 0 ? (
          <ChartRealtime data={history} />
        ) : (
          <div className="flex-1 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center p-24 shadow">
            <img src={cowIcon} alt="No Data" className="w-20 h-20 mb-4 opacity-80" />
            <p className="text-gray-700 font-medium">Belum ada data suhu untuk sapi ini.</p>
          </div>
        )
      ) : (
        <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 flex-1 items-center justify-center text-center p-24">
          <img src={cowIcon} alt="No Sapi" className="w-24 h-24 mb-4 opacity-90" />
          <p className="text-gray-700 font-medium">Belum ada ID sapi yang terdaftar.</p>
          <p className="text-gray-400 text-sm">
            Tambahkan data sapi terlebih dahulu untuk memulai monitoring.
          </p>
        </div>
      )}
    </div>


      {/* Average & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
        {/* Average Suhu */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-2">Rata-rata Suhu</h2>
          {history.length > 0 && avgData.avg_temp ? (
            <p className="text-2xl font-bold">
              {avgData.avg_temp.toFixed(2)}°C
              <span className="ml-2 text-green-600">
                ({categorizeTemperature(avgData.avg_temp)})
              </span>
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400">
              <img src={cowIcon} alt="No Avg" className="w-16 h-16 mb-3 opacity-70" />
              <p>Belum ada data rata-rata suhu</p>
            </div>
          )}
        </div>

        {/* History Realtime */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-2">History Realtime</h2>
          {history.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto w-full">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between border-b py-2 text-sm px-2">
                  <span>{h.time}</span>
                  <span>{h.temperature}°C</span>
                  <span>{categorizeTemperature(h.temperature)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400">
              <img src={cowIcon} alt="No History" className="w-16 h-16 mb-3 opacity-70" />
              <p>Belum ada data riwayat suhu sapi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
