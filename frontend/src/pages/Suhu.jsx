import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getHistory, getAverage, getSensorStatus, getAllCows } from "../services/temperatureService";

// Dummy icons - replace with your actual icon imports
const CowIcon = () => (
  <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

// Components
const Navbar = ({ title }) => (
  <div className="w-full border-b border-gray-200 bg-white px-6 py-6">
    <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
  </div>
);

const Dropdown = ({ options, value, onChange }) => (
  <select
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white"
  >
    <option value="">Pilih Sapi</option>
    {options.map((opt) => (
      <option key={opt.id} value={opt.id}>
        {opt.name}
      </option>
    ))}
  </select>
);

const SensorStatus = ({ sensorStatus }) => {
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

const ChartRealtime = ({ data }) => {
  // Format data untuk menampilkan menit.detik di X-axis
  const formattedData = data.map((item, index) => {
    const timeObj = new Date(item.fullDate || new Date());
    const minutes = timeObj.getMinutes();
    const seconds = timeObj.getSeconds();

    return {
      ...item,
      index: index + 1,
      displayTime: `${minutes}.${seconds.toString().padStart(2, '0')}`,
      fullDate: item.fullDate || new Date()
    };
  });

  const categorizeTemp = (temp) => {
    if (temp < 37.5) return "Hipotermia";
    if (temp >= 37.5 && temp <= 39.5) return "Normal";
    if (temp > 39.5 && temp <= 40.5) return "Demam Ringan";
    if (temp > 40.5 && temp <= 41.5) return "Demam Tinggi";
    return "Kritis";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const temp = payload[0].value;
      const category = categorizeTemp(temp);
      const dateObj = new Date(data.fullDate);

      // Format tanggal: 18 Oktober 2025
      const dateStr = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Format waktu: 16h.45m.10s
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const seconds = dateObj.getSeconds();
      const timeStr = `${hours}h.${minutes.toString().padStart(2, '0')}m.${seconds.toString().padStart(2, '0')}s`;

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-base font-bold text-gray-800 mb-1">
            {temp.toFixed(1)}°C - {category}
          </p>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <p className="text-sm text-gray-600">{dateStr}</p>
            <p className="text-sm font-medium text-gray-700">{timeStr}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="displayTime"
          tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
          stroke="#d1d5db"
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Menit.Detik',
            position: 'insideBottom',
            offset: -10,
            style: { fontSize: 11, fill: '#9ca3af' }
          }}
        />
        <YAxis
          domain={['dataMin - 0.5', 'dataMax + 0.5']}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          stroke="#d1d5db"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value.toFixed(1)}°C`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} />
        <Bar
          dataKey="temperature"
          radius={[8, 8, 0, 0]}
          maxBarSize={40}
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === formattedData.length - 1 ? "#22c55e" : "#86efac"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const categorizeTemperature = (temp) => {
  if (temp < 37.5) return { label: "Hipotermia", color: "blue" };
  if (temp >= 37.5 && temp <= 39.5) return { label: "Normal", color: "green" };
  if (temp > 39.5 && temp <= 40.5) return { label: "Demam Ringan", color: "yellow" };
  if (temp > 40.5 && temp <= 41.5) return { label: "Demam Tinggi", color: "orange" };
  return { label: "Kritis", color: "red" };
};

const getCategoryStyles = (color) => {
  const styles = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200"
  };
  return styles[color] || styles.green;
};

export default function Suhu() {
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [history, setHistory] = useState([]);
  const [avgData, setAvgData] = useState({ avg_temp: null });
  const [sensorStatus, setSensorStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

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
          temperature: parseFloat(h.temperature.toFixed(1)), // Round to 1 decimal
        }));

        setHistory(formatted.reverse());
        setAvgData(avg && avg.average ? { avg_temp: avg.average } : { avg_temp: null });
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

  const avgCategory = avgData.avg_temp ? categorizeTemperature(avgData.avg_temp) : null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Navbar title="Suhu" />

      {cows.length > 0 && (
        <div className="flex items-center gap-6 px-6 py-4 bg-white border-b border-gray-100">
          <Dropdown
            value={cowId}
            onChange={(val) => setCowId(Number(val))}
            options={cows.map((c) => ({ id: c.id, name: c.tag }))}
          />
        </div>
      )}

      {cows.length > 0 && (
        <div className="px-6 pt-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {cows.length === 0 && !loading && (
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all font-medium">
            <PlusIcon />
            <span>Tambah Sapi</span>
          </button>
        )}

        {/* REALTIME GRAPHICS */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
              <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
            </div>
            <select className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition">
              <option>Per Menit</option>
              <option>Per Jam</option>
            </select>
          </div>

          <div className="bg-gray-50 min-h-[400px] flex items-center justify-center">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Memuat data sapi...</p>
              </div>
            ) : cows.length > 0 ? (
              history.length > 0 ? (
                <div className="w-full h-full p-6">
                  <ChartRealtime data={history} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CowIcon />
                  <p className="text-gray-700 font-medium mt-4">Belum ada data suhu untuk sapi ini.</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CowIcon />
                <p className="text-gray-700 font-medium mt-4">Belum ada ID sapi yang terdaftar.</p>
                <p className="text-gray-400 text-sm mt-1">Tambahkan data sapi terlebih dahulu untuk memulai monitoring.</p>
              </div>
            )}
          </div>
        </div>

        {/* AVERAGE & HISTORY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AVERAGE */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Rata-rata Suhu</h2>
                <p className="text-sm text-gray-500">60 Data Terakhir</p>
              </div>
            </div>

            {history.length > 0 && avgData.avg_temp ? (
              <div className="text-center py-8">
                <div className="relative inline-block">
                  <div className="text-6xl font-bold text-gray-800 mb-3">
                    {avgData.avg_temp.toFixed(1)}
                    <span className="text-3xl text-gray-500">°C</span>
                  </div>
                  <div className="absolute -top-2 -right-12">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(avgCategory.color)} border`}>
                      {avgCategory.label}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getCategoryStyles(avgCategory.color)}`}>
                      {avgCategory.label}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Sampel Data</p>
                    <p className="text-2xl font-bold text-gray-800">60</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CowIcon />
                <p className="text-gray-600 font-medium mt-4">Belum ada data rata-rata suhu</p>
                <p className="text-sm text-gray-400 mt-1">Menunggu data dari sensor...</p>
              </div>
            )}
          </div>

          {/* HISTORY */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">History Realtime</h2>
                <p className="text-sm text-gray-500">20 Data Terakhir</p>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  {history.map((h, i) => {
                    const category = categorizeTemperature(h.temperature);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <span className="text-sm font-medium text-gray-600 w-24">{h.time}</span>
                        <span className="text-lg font-bold text-gray-800">{h.temperature.toFixed(1)}°C</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(category.color)} border`}>
                          {category.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CowIcon />
                <p className="text-gray-600 font-medium mt-4">Belum ada data riwayat suhu</p>
                <p className="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah sensor aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
      `}</style>
    </div>
  );
}