import { useEffect, useState } from "react";

// Import fungsi API dari service
import { getHistory, getSensorStatus, getAllCows } from "../services/temperatureService";

// Import komponen dan utilitas dari folder suhu
import {
  TIME_FILTERS,
  filterDataByTimePeriod,
  categorizeTemperature,
  getCategoryStyles
} from "../components/suhu/SuhuUtils";
import { Navbar, Dropdown, CowIcon, PlusIcon } from "../components/suhu/SuhuPageComponents";
import SensorStatus from "../components/suhu/SensorStatus";
import ChartRealtime from "../components/suhu/ChartRealtime";
import TemperatureDistribution from "../components/suhu/TemperatureDistribution";

export default function Suhu() {
  // State utama
  const [cows, setCows] = useState([]);                                    // Menyimpan daftar sapi dari database
  const [cowId, setCowId] = useState(null);                                // Menyimpan ID sapi yang sedang dipantau
  const [rawHistory, setRawHistory] = useState([]);                        // Menyimpan data mentah suhu dari API
  const [filteredHistory, setFilteredHistory] = useState([]);              // Menyimpan data suhu setelah difilter berdasarkan periode waktu
  const [displayedData, setDisplayedData] = useState([]);                  // Data yang sedang ditampilkan pada grafik/histori
  const [avgData, setAvgData] = useState({ avg_temp: null });              // Menyimpan suhu rata-rata
  const [sensorStatus, setSensorStatus] = useState("checking");            // Menyimpan status sensor ("online", "offline", atau "checking")
  const [loading, setLoading] = useState(true);                            // Status loading awal
  const [timePeriod, setTimePeriod] = useState(TIME_FILTERS.MINUTE.value); // Filter waktu (per menit, jam, hari, dst)
  const [dataOffset, setDataOffset] = useState(0);                         // Offset data untuk pagination
  const [totalPages, setTotalPages] = useState(0);                         // Total halaman data
  const ITEMS_PER_PAGE = 25;                                               // Jumlah data per halaman

  // 🔹 useEffect pertama: mengambil daftar sapi dari server saat pertama kali halaman dibuka
  useEffect(() => {
    const fetchCows = async () => {
      try {
        setLoading(true);
        const allCows = await getAllCows(); // Ambil semua data sapi dari API
        setCows(allCows);
        if (allCows.length > 0) setCowId(allCows[0].id); // Pilih sapi pertama secara default
      } catch (err) {
        console.error("Gagal mengambil data sapi:", err);
        setCows([]); // Jika gagal, kosongkan data sapi
      } finally {
        setLoading(false);
      }
    };
    fetchCows();
  }, []);

  // 🔹 useEffect kedua: memantau perubahan cowId atau timePeriod, lalu polling data suhu dari API
  useEffect(() => {
    if (!cowId) {
      // Jika belum ada sapi yang dipilih, kosongkan semua data
      setRawHistory([]);
      setFilteredHistory([]);
      setAvgData({ avg_temp: null });
      setSensorStatus("offline");
      return;
    }

    const pollData = async () => {
      try {
        // Periksa status sensor terlebih dahulu
        const statusResult = await getSensorStatus(cowId);
        setSensorStatus(statusResult.status);

        // Jika sensor tidak online, hentikan pengambilan data
        if (statusResult.status !== "online") {
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_temp: null });
          return;
        }

        // Ambil batas data berdasarkan filter waktu (menit, jam, hari, dll.)
        const limit = TIME_FILTERS[Object.keys(TIME_FILTERS).find(key =>
          TIME_FILTERS[key].value === timePeriod
        )].limit || 500;

        // Ambil data riwayat suhu dari API
        const hist = await getHistory(cowId, limit);

        // Format hasil data untuk menyesuaikan tampilan di grafik/histori
        const formatted = hist.map((h) => ({
          time: new Date(h.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          temperature: parseFloat(h.temperature.toFixed(1)),
          fullDate: h.created_at
        }));

        setRawHistory(formatted);
      } catch (err) {
        console.error("Gagal melakukan polling data:", err);
        setSensorStatus("offline");
        setRawHistory([]);
        setFilteredHistory([]);
        setAvgData({ avg_temp: null });
      }
    };

    pollData(); // Jalankan fungsi pertama kali
    const interval = setInterval(pollData, 5000); // Jalankan setiap 5 detik (realtime)
    return () => clearInterval(interval); // Bersihkan interval saat komponen di-unmount
  }, [cowId, timePeriod]);

  // 🔹 useEffect ketiga: filter dan hitung rata-rata data setiap kali rawHistory atau timePeriod berubah
  useEffect(() => {
    if (rawHistory.length > 0) {
      const filtered = filterDataByTimePeriod(rawHistory, timePeriod); // Filter data sesuai periode waktu
      setFilteredHistory(filtered);

      // Reset pagination ke halaman pertama
      setDataOffset(0);

      // Hitung total halaman
      const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      setTotalPages(pages);

      // Hitung suhu rata-rata
      if (filtered.length > 0) {
        const sum = filtered.reduce((acc, item) => acc + item.temperature, 0);
        const avg = sum / filtered.length;
        setAvgData({ avg_temp: avg });
      } else {
        setAvgData({ avg_temp: null });
      }
    } else {
      // Jika tidak ada data sama sekali
      setFilteredHistory([]);
      setDisplayedData([]);
      setAvgData({ avg_temp: null });
      setTotalPages(0);
    }
  }, [rawHistory, timePeriod]);

  // 🔹 useEffect keempat: memperbarui data yang sedang ditampilkan berdasarkan offset (pagination)
  useEffect(() => {
    if (filteredHistory.length > 0) {
      const startIndex = dataOffset;
      const endIndex = Math.min(filteredHistory.length, startIndex + ITEMS_PER_PAGE);
      const sliced = filteredHistory.slice(startIndex, endIndex); // Potong data sesuai halaman
      setDisplayedData(sliced);
    } else {
      setDisplayedData([]);
    }
  }, [filteredHistory, dataOffset]);

  // 🔹 Fungsi navigasi halaman (sebelumnya dan selanjutnya)
  const handlePrevPage = () => {
    if (dataOffset > 0) {
      setDataOffset(Math.max(0, dataOffset - ITEMS_PER_PAGE));
    }
  };

  const handleNextPage = () => {
    if (dataOffset + ITEMS_PER_PAGE < filteredHistory.length) {
      setDataOffset(dataOffset + ITEMS_PER_PAGE);
    }
  };

  // 🔹 Mengembalikan halaman saat ini (dari total halaman)
  const getCurrentPage = () => {
    return Math.floor(dataOffset / ITEMS_PER_PAGE) + 1;
  };

  // 🔹 Membuat daftar opsi halaman untuk dropdown pagination
  const getPageOptions = () => {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
      const isCurrentPage = i === (totalPages - getCurrentPage());
      const label = i === 0 ? 'Terbaru' : `${i * ITEMS_PER_PAGE} data sebelumnya`;
      options.push({
        value: i * ITEMS_PER_PAGE,
        label: label,
        isCurrent: isCurrentPage
      });
    }
    return options.reverse(); // Urutkan dari terbaru ke terlama
  };

  const handlePageSelect = (offset) => {
    setDataOffset(Number(offset));
  };

  // 🔹 Klasifikasi suhu rata-rata (Normal, Panas, Hipotermia, dll)
  const avgCategory = avgData.avg_temp ? categorizeTemperature(avgData.avg_temp) : null;

  // 🔹 Mendapatkan label periode waktu aktif (Per Jam, Per Hari, dst.)
  const getTimePeriodLabel = () => {
    const filter = Object.values(TIME_FILTERS).find(f => f.value === timePeriod);
    return filter ? filter.label : 'Data';
  };

  // 🔹 Render utama halaman
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      
      {/* Navbar bagian atas */}
      <Navbar title="Suhu" />

      {/* Dropdown pemilihan sapi */}
      {cows.length > 0 && (
        <div className="flex items-center gap-6 px-6 py-4 bg-white border-b border-gray-100">
          <Dropdown
            value={cowId}
            onChange={(val) => setCowId(Number(val))}
            options={cows.map((c) => ({ id: c.id, name: c.tag }))}
          />
        </div>
      )}

      {/* Status sensor */}
      {cows.length > 0 && (
        <div className="px-6 pt-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      {/* Bagian utama: grafik realtime, rata-rata, dan riwayat */}
      <div className="px-6 py-6 space-y-6">
        {/* Tombol tambah sapi jika belum ada */}
        {cows.length === 0 && !loading && (
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all font-medium">
            <PlusIcon />
            <span>Tambah Sapi</span>
          </button>
        )}

        {/* BAGIAN GRAFIK REALTIME */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          {/* Header bagian grafik */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
              <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
            </div>

            {/* Dropdown periode waktu dan navigasi halaman */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Pilihan periode waktu */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition"
              >
                {Object.values(TIME_FILTERS).map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              {/* Dropdown pagination */}
              {filteredHistory.length > ITEMS_PER_PAGE && (
                <select
                  value={dataOffset}
                  onChange={(e) => handlePageSelect(e.target.value)}
                  className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-green-400 hover:shadow transition"
                >
                  {getPageOptions().map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Tombol navigasi halaman */}
              {filteredHistory.length > ITEMS_PER_PAGE && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={dataOffset + ITEMS_PER_PAGE >= filteredHistory.length}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <span className="text-sm text-gray-600 font-medium px-2">
                    {getCurrentPage()} / {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={dataOffset === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tampilan isi grafik atau pesan kosong */}
          <div className="bg-gray-50 min-h-[400px] flex items-center justify-center">
            {loading ? (
              // Ketika loading
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Memuat data sapi...</p>
              </div>
            ) : cows.length > 0 ? (
              displayedData.length > 0 ? (
                // Grafik data realtime
                <div className="w-full h-full p-6">
                  <ChartRealtime data={displayedData} />

                  {/* Informasi range data */}
                  {filteredHistory.length > ITEMS_PER_PAGE && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Menampilkan data {dataOffset + 1} - {Math.min(filteredHistory.length, dataOffset + ITEMS_PER_PAGE)} dari {filteredHistory.length} total data
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Jika belum ada data suhu
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CowIcon />
                  <p className="text-gray-700 font-medium mt-4">Belum ada data suhu untuk periode ini.</p>
                </div>
              )
            ) : (
              // Jika belum ada sapi terdaftar
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

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Rata-rata Suhu</h2>
                <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Isi rata-rata */}
            {filteredHistory.length > 0 && avgData.avg_temp ? (
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

                {/* Status dan jumlah data */}
                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getCategoryStyles(avgCategory.color)}`}>
                      {avgCategory.label}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Sampel Data</p>
                    <p className="text-2xl font-bold text-gray-800">{filteredHistory.length}</p>
                  </div>
                </div>

                <TemperatureDistribution history={filteredHistory} />
              </div>
            ) : (
              // Jika belum ada data rata-rata
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
                <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Daftar riwayat suhu */}
            {filteredHistory.length > 0 ? (
              <div className="max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  {filteredHistory.map((h, i) => {
                    const category = categorizeTemperature(h.temperature);
                    const actualIndex = i + 1;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <span className="text-sm font-bold text-gray-500 w-12">#{actualIndex}</span>
                        <span className="text-sm font-medium text-gray-600 w-24">{h.time}</span>
                        <span className="text-lg font-bold text-gray-800">{h.temperature.toFixed(1)}°C</span>
                        <div className="w-[120px] flex justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyles(category.color)} border`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Jika belum ada riwayat
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CowIcon />
                <p className="text-gray-600 font-medium mt-4">Belum ada data riwayat suhu</p>
                <p className="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah sensor aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styling untuk scrollbar dan animasi */}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
