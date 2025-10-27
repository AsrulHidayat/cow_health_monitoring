import { useEffect, useState, useRef } from "react";

// 🔹 Import API services
import { getHistory, getSensorStatus, getAllCows, getTemperatureStats } from "../services/temperatureService";

// 🔹 Import utilitas dan komponen UI
import {
  TIME_FILTERS,
  TEMPERATURE_CATEGORIES,
  filterDataByTimePeriod,
  categorizeTemperature,
  getCategoryStyles
} from "../components/suhu/SuhuUtils";
import { Navbar, Dropdown, CowIcon, PlusIcon } from "../components/suhu/SuhuPageComponents";
import SensorStatus from "../components/suhu/SensorStatus";
import ChartRealtime from "../components/suhu/ChartRealtime";
import TemperatureDistribution from "../components/suhu/TemperatureDistribution";
import DateTimeRangePicker from "../components/suhu/DateTimeRangePicker";

export default function Suhu() {
  // ==========================
  // 🔹 State utama
  // ==========================
  const [cows, setCows] = useState([]);                                     // daftar sapi
  const [cowId, setCowId] = useState(null);                                 // sapi yang dipilih
  const [rawHistory, setRawHistory] = useState([]);                         // data suhu mentah
  const [filteredHistory, setFilteredHistory] = useState([]);               // data setelah filter waktu & kategori
  const [displayedData, setDisplayedData] = useState([]);                   // data yang ditampilkan per halaman
  const [avgData, setAvgData] = useState({ avg_temp: null });               // rata-rata suhu
  const [sensorStatus, setSensorStatus] = useState("checking");             // status sensor: online/offline/checking
  const [loading, setLoading] = useState(true);                             // state loading
  const [timePeriod, setTimePeriod] = useState(TIME_FILTERS.MINUTE.value);  // filter periode waktu
  const [dataOffset, setDataOffset] = useState(0);                          // offset untuk pagination
  const [totalPages, setTotalPages] = useState(0);                          // total halaman
  const ITEMS_PER_PAGE = 25;                                                // jumlah data per halaman

  // ==================================
  // 🔹 Filter tanggal dan kategori
  // ==================================
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });                      // rentang tanggal filter
  const [datePickerStats, setDatePickerStats] = useState(null);                                        // stats untuk date picker
  const [appliedTimeRange, setAppliedTimeRange] = useState({ startTime: "00:00", endTime: "23:59" });  // filter jam khusus
  const [filterCategory, setFilterCategory] = useState("ALL");                                         // filter kategori suhu

  // ==========================
  // 🔹 Ref untuk polling
  // ==========================
  const pollingRef = useRef(null);

  // Ambil data sapi yang dipilih
  const selectedCow = cows.find(c => c.id === cowId);

  // ===================================================
  // 🔹 Ambil daftar sapi saat pertama kali render
  // ===================================================
  useEffect(() => {
    const fetchCows = async () => {
      try {
        setLoading(true);
        const allCows = await getAllCows();
        setCows(allCows);
        if (allCows.length > 0) setCowId(allCows[0].id); // set sapi pertama jika ada
      } catch (err) {
        console.error("Gagal mengambil data sapi:", err);
        setCows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCows();
  }, []);

  // ============================================
  // 🔹 Ambil statistik suhu untuk date picker
  // ============================================
  useEffect(() => {
    if (!cowId) return;

    const fetchStats = async () => {
      try {
        const stats = await getTemperatureStats(cowId);
        setDatePickerStats(stats);
      } catch (err) {
        console.error("Gagal mengambil stats data:", err);
      }
    };
    fetchStats();
  }, [cowId]);

  // ============================================
  // 🔹 Polling data suhu secara realtime
  // ============================================
  useEffect(() => {
    if (!cowId) {
      setRawHistory([]);
      setFilteredHistory([]);
      setAvgData({ avg_temp: null });
      setSensorStatus("offline");
      return;
    }

    const isDateRangeMode = dateRange.startDate && dateRange.endDate;
    const currentPollId = Date.now();
    pollingRef.current = currentPollId;

    const pollData = async () => {
      try {
        if (pollingRef.current !== currentPollId) return;

        // 🔸 Cek status sensor
        const statusResult = await getSensorStatus(cowId);
        if (pollingRef.current !== currentPollId) return;
        setSensorStatus(statusResult.status);

        // 🔸 Jika sensor offline → reset data
        if (statusResult.status !== "online" && !isDateRangeMode) {
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_temp: null });
          return;
        }

        // 🔸 Batas jumlah data
        const limit = isDateRangeMode
          ? 10000
          : (TIME_FILTERS[Object.keys(TIME_FILTERS).find(key => TIME_FILTERS[key].value === timePeriod)]?.limit || 500);

        let start = dateRange.startDate;
        let end = dateRange.endDate;
        let formatted = [];

        // 🔸 Realtime mode → ambil data terbaru
        if (!start || !end) {
          const histResponse = await getHistory(cowId, limit, 0);
          if (pollingRef.current !== currentPollId) return;

          formatted = histResponse.data.map((h) => ({
            time: new Date(h.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temperature: parseFloat(h.temperature.toFixed(1)),
            fullDate: h.created_at,
          }));

          setRawHistory(formatted);
          return;
        }

        // 🔸 Jika start dan end sama → tambah 1 hari
        if (start === end) {
          const endDateObj = new Date(end);
          endDateObj.setDate(endDateObj.getDate() + 1);
          end = endDateObj.toISOString().split("T")[0];
        }

        // 🔸 Ambil data sesuai rentang tanggal
        const histResponse = await getHistory(cowId, limit, 0, start, end);
        if (pollingRef.current !== currentPollId) return;

        formatted = histResponse.data.map((h) => ({
          time: new Date(h.created_at).toLocaleTimeString("id-ID", {
            hour   : "2-digit",
            minute : "2-digit",
            second : "2-digit",
          }),
          temperature: parseFloat(h.temperature.toFixed(1)),
          fullDate : h.created_at,
        }));

        setRawHistory(formatted);
      } catch (err) {
        if (pollingRef.current === currentPollId) {
          console.error("Gagal melakukan polling data:", err);
          setSensorStatus("offline");
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_temp: null });
        }
      }
    };

    pollData();

    // 🔸 Jika realtime → polling setiap 5 detik
    if (!isDateRangeMode) {
      const interval = setInterval(pollData, 5000);
      return () => clearInterval(interval);
    }
  }, [cowId, timePeriod, dateRange]);

  // =====================================================
  // 🔹 Filter data berdasarkan waktu, kategori, dan jam
  // =====================================================
  useEffect(() => {
    const isDateRangeMode = dateRange.startDate && dateRange.endDate;

    let baseData = rawHistory.length > 0
      ? filterDataByTimePeriod(rawHistory, timePeriod, isDateRangeMode, dateRange.startDate, dateRange.endDate)
      : [];

    // 🔸 Filter berdasarkan jam
    const { startTime, endTime } = appliedTimeRange;
    const timeFilteredData =
      startTime !== "00:00" || endTime !== "23:59"
        ? baseData.filter((item) => {
          const itemDate = new Date(item.fullDate);
          const hours    = itemDate.getHours().toString().padStart(2, "0");
          const minutes  = itemDate.getMinutes().toString().padStart(2, "0");
          const itemTime = `${hours}:${minutes}`;
          return itemTime >= startTime && itemTime <= endTime;
        })
        : baseData;

    // 🔸 Filter berdasarkan kategori
    const categoryFilteredData =
      filterCategory === "ALL"
        ? timeFilteredData
        : timeFilteredData.filter((item) => {
          const categoryInfo = categorizeTemperature(item.temperature);
          return categoryInfo.value === filterCategory;
        });

    setFilteredHistory(categoryFilteredData);
    setTotalPages(Math.ceil(categoryFilteredData.length / ITEMS_PER_PAGE));

    // 🔸 Hitung rata-rata
    if (categoryFilteredData.length > 0) {
      const sum = categoryFilteredData.reduce((acc, item) => acc + item.temperature, 0);
      setAvgData({ avg_temp: sum / categoryFilteredData.length });
    } else {
      setAvgData({ avg_temp: null });
    }
  }, [rawHistory, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  // 🔹 Reset halaman saat filter berubah
  useEffect(() => {
    setDataOffset(0);
  }, [cowId, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  // =====================================================
  // 🔹 Tentukan data yang akan ditampilkan di halaman
  // =====================================================
  useEffect(() => {
    if (filteredHistory.length > 0) {
      const startIndex = dataOffset;
      const endIndex = Math.min(filteredHistory.length, startIndex + ITEMS_PER_PAGE);
      setDisplayedData(filteredHistory.slice(startIndex, endIndex));
    } else {
      setDisplayedData([]);
    }
  }, [filteredHistory, dataOffset]);

  // ==========================
  // 🔹 Pagination
  // ==========================
  const handlePrevPage = () => {
    if (dataOffset > 0) setDataOffset(Math.max(0, dataOffset - ITEMS_PER_PAGE));
  };
  const handleNextPage = () => {
    if (dataOffset + ITEMS_PER_PAGE < filteredHistory.length) setDataOffset(dataOffset + ITEMS_PER_PAGE);
  };
  const handlePageSelect = (val) => setDataOffset(Number(val));
  const getCurrentPage = () => Math.floor(dataOffset / ITEMS_PER_PAGE) + 1;
  const getPageOptions = () => {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
      const label = i === 0 ? "Terbaru" : `${i * ITEMS_PER_PAGE} data sebelumnya`;
      options.push({ value: i * ITEMS_PER_PAGE, label });
    }
    return options.reverse();
  };

  const avgCategory = avgData.avg_temp ? categorizeTemperature(avgData.avg_temp) : null;

  // ==========================
  // 🔹 Label periode waktu
  // ==========================
  const getTimePeriodLabel = () => {
    if (dateRange.startDate && dateRange.endDate) {
      try {
        const start = new Date(dateRange.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        const end = new Date(dateRange.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        return `${start} - ${end}`;
      } catch {
        return "Rentang Kustom";
      }
    }
    const filter = Object.values(TIME_FILTERS).find((f) => f.value === timePeriod);
    return filter ? filter.label : "Data";
  };

  // ==========================
  // 🔹 Render halaman utama
  // ==========================
  return (
    // 🔹 Container utama halaman
    // Flex column agar seluruh konten tersusun vertikal
    <div className="flex flex-col w-full min-h-screen bg-gray-50">

      {/* 🔹 Navbar */}
      {/* Terletak di atas halaman, menampilkan judul dan pilihan sapi */}
      <Navbar
        title="Suhu"
        cowId={cowId}
        cowData={selectedCow}
      />

      {/* 🔹 Dropdown pemilihan sapi */}
      {/* Layout: flex horizontal, di bawah navbar */}
      {cows.length > 0 && (
        <div className="flex items-center gap-6 px-6 py-4 bg-white border-b border-gray-100">
          <Dropdown
            value={cowId}
            onChange={(val) => setCowId(Number(val))}
            options={cows.map((c) => ({ id: c.id, name: c.tag }))}
          />
        </div>
      )}

      {/* 🔹 Status Sensor */}
      {/* Layout: box kecil di bawah dropdown */}
      {cows.length > 0 && (
        <div className="px-6 pt-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      {/* 🔹 Kontainer utama grafik dan kontrol */}
      <div className="px-6 py-6 space-y-6">

        {/* 🔹 Tombol tambah sapi */}
        {/* Muncul hanya jika tidak ada sapi dan loading selesai */}
        {cows.length === 0 && !loading && (
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all font-medium">
            <PlusIcon />
            <span>Tambah Sapi</span>
          </button>
        )}

        {/* 🔹 Container Realtime Graphics */}
        {/* Layout: card dengan border, background putih */}
        <div className="bg-gray-50 rounded-xl border border-gray-200">

          {/* 🔹 Header Grafik */}
          {/* Layout: flex row, title + filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
              <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
            </div>

            {/* 🔹 Kontrol filter (tanggal, kategori, periode, pagination) */}
            <div className="flex flex-wrap items-center gap-3">
              <DateTimeRangePicker
                onApply={({ startDate, endDate, startTime, endTime }) => {
                  setDateRange({ startDate, endDate });
                  setAppliedTimeRange({ startTime, endTime });
                }}
                onReset={() => {
                  setDateRange({ startDate: null, endDate: null });
                  setAppliedTimeRange({ startTime: "00:00", endTime: "23:59" });
                }}
                stats={datePickerStats}
                timeCategory={timePeriod}
              />

              {/* Filter kategori suhu */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition"
              >
                {TEMPERATURE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Filter periode waktu */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className={`border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition ${dateRange.startDate && dateRange.endDate ? 'bg-gray-100 opacity-70 cursor-not-allowed' : ''
                  }`}
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
                    disabled={dataOffset === 0}
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
                    disabled={dataOffset + ITEMS_PER_PAGE >= filteredHistory.length}
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

          {/* 🔹 Kontainer Chart Realtime */}
          {/* Layout: flex center, menampilkan loading, grafik, atau pesan kosong */}
          <div className="bg-gray-50 min-h-[400px] flex items-center justify-center rounded-b-xl">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Memuat data sapi...</p>
              </div>
            ) : cows.length > 0 ? (
              displayedData.length > 0 ? (
                <div className="w-full h-full p-6">
                  <ChartRealtime data={displayedData} />

                  {filteredHistory.length > ITEMS_PER_PAGE && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Menampilkan data {dataOffset + 1} - {Math.min(filteredHistory.length, dataOffset + ITEMS_PER_PAGE)} dari {filteredHistory.length} total data
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CowIcon />
                  <p className="text-gray-700 font-medium mt-4">Belum ada data suhu untuk periode ini.</p>
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

        {/* 🔹 Grid AVERAGE & HISTORY */}
        {/* Layout: dua kolom di layar besar, satu kolom di mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AVERAGE */}
          {/* Card: menampilkan rata-rata suhu, status, jumlah sampel, dan pie chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                {/* Icon rata-rata */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Rata-rata Suhu</h2>
                <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Konten rata-rata */}
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

                {/* Statistik tambahan: status & jumlah sampel */}
                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getCategoryStyles(avgCategory.color)}`}>
                      {avgCategory.label}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Sampel Data</p>
                    <p className="text-2xl font-bold text-gray-800">{displayedData.length}</p>
                  </div>
                </div>

                {/* Pie chart distribusi */}
                <TemperatureDistribution history={filteredHistory} />
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
          {/* Card: menampilkan daftar data suhu realtime */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                {/* Icon history */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">History Realtime</h2>
                <p className="text-sm text-gray-500">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Konten history */}
            {filteredHistory.length > 0 ? (
              <div className="max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  {displayedData.map((h, i) => {
                    const category = categorizeTemperature(h.temperature);
                    const actualIndex = dataOffset + i + 1;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <span className="text-sm font-bold text-gray-500 w-12">#{actualIndex}</span>
                        <span className="text-sm font-medium text-gray-600 w-24">{h.time}</span>
                        <span className="text-lg font-bold text-gray-800">
                          {h.temperature !== null && h.temperature !== undefined
                            ? h.temperature.toFixed(1)
                            : "--"}
                          °C
                        </span>
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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CowIcon />
                <p className="text-gray-600 font-medium mt-4">Belum ada data riwayat suhu</p>
                <p className="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah sensor aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Custom scrollbar & animasi */}
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