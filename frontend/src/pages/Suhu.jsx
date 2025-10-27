import { useEffect, useState, useRef } from "react";
import axios from "axios";

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
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [avgData, setAvgData] = useState({ avg_temp: null });
  const [sensorStatus, setSensorStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState(TIME_FILTERS.MINUTE.value);
  const [dataOffset, setDataOffset] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 25;

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ==================================
  // 🔹 Filter tanggal dan kategori
  // ==================================
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [datePickerStats, setDatePickerStats] = useState(null);
  const [appliedTimeRange, setAppliedTimeRange] = useState({ startTime: "00:00", endTime: "23:59" });
  const [filterCategory, setFilterCategory] = useState("ALL");

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

        const statusResult = await getSensorStatus(cowId);
        if (pollingRef.current !== currentPollId) return;
        setSensorStatus(statusResult.status);

        if (statusResult.status !== "online" && !isDateRangeMode) {
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_temp: null });
          return;
        }

        const limit = isDateRangeMode
          ? 10000
          : (TIME_FILTERS[Object.keys(TIME_FILTERS).find(key => TIME_FILTERS[key].value === timePeriod)]?.limit || 500);

        let start = dateRange.startDate;
        let end = dateRange.endDate;
        let formatted = [];

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

        if (start === end) {
          const endDateObj = new Date(end);
          endDateObj.setDate(endDateObj.getDate() + 1);
          end = endDateObj.toISOString().split("T")[0];
        }

        const histResponse = await getHistory(cowId, limit, 0, start, end);
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

    const { startTime, endTime } = appliedTimeRange;
    const timeFilteredData =
      startTime !== "00:00" || endTime !== "23:59"
        ? baseData.filter((item) => {
          const itemDate = new Date(item.fullDate);
          const hours = itemDate.getHours().toString().padStart(2, "0");
          const minutes = itemDate.getMinutes().toString().padStart(2, "0");
          const itemTime = `${hours}:${minutes}`;
          return itemTime >= startTime && itemTime <= endTime;
        })
        : baseData;

    const categoryFilteredData =
      filterCategory === "ALL"
        ? timeFilteredData
        : timeFilteredData.filter((item) => {
          const categoryInfo = categorizeTemperature(item.temperature);
          return categoryInfo.value === filterCategory;
        });

    setFilteredHistory(categoryFilteredData);
    setTotalPages(Math.ceil(categoryFilteredData.length / ITEMS_PER_PAGE));

    if (categoryFilteredData.length > 0) {
      const sum = categoryFilteredData.reduce((acc, item) => acc + item.temperature, 0);
      setAvgData({ avg_temp: sum / categoryFilteredData.length });
    } else {
      setAvgData({ avg_temp: null });
    }
  }, [rawHistory, timePeriod, dateRange, filterCategory, appliedTimeRange]);

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
  // 🔹 Helper Functions
  // ==========================

  // Fungsi untuk menentukan kondisi sapi berdasarkan sensor
  const getCowCondition = () => {
    if (!selectedCow || !avgData.avg_temp) return "Normal";

    let abnormalSensors = 0;

    // 1. Cek sensor suhu
    const temp = avgData.avg_temp;
    const isTempAbnormal = temp < 37.5 || temp > 39.5;
    if (isTempAbnormal) abnormalSensors++;

    // 2. Cek sensor detak jantung (placeholder - nanti ambil dari API)
    const heartRate = selectedCow?.heartRate || 70;
    const isHeartRateAbnormal = heartRate < 60 || heartRate > 80;
    if (isHeartRateAbnormal) abnormalSensors++;

    // 3. Cek sensor gerakan/aktivitas (placeholder - nanti ambil dari API)
    const activity = selectedCow?.activity || "active";
    const isActivityAbnormal = activity === "inactive" || activity === "abnormal";
    if (isActivityAbnormal) abnormalSensors++;

    if (abnormalSensors === 0) return "Normal";
    if (abnormalSensors === 1) return "Perlu Diperhatikan";
    if (abnormalSensors === 2) return "Harus Diperhatikan";
    return "Segera Tindaki";
  };

  // Fungsi untuk styling kondisi sapi
  const getCowConditionStyle = () => {
    const condition = getCowCondition();
    const styles = {
      "Normal": "bg-green-100 text-green-700 border border-green-200",
      "Perlu Diperhatikan": "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "Harus Diperhatikan": "bg-orange-100 text-orange-700 border border-orange-200",
      "Segera Tindaki": "bg-red-100 text-red-700 border border-red-200"
    };
    return styles[condition] || styles["Normal"];
  };

  // Handle edit status pemeriksaan
  const handleEditCheckup = async (status) => {
    if (!cowId) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5001/api/cows/${cowId}/checkup-status`,
        { checkupStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCows(prevCows =>
        prevCows.map(cow =>
          cow.id === cowId
            ? { ...cow, checkupStatus: status }
            : cow
        )
      );

      setShowEditModal(false);
      alert(`✅ Status pemeriksaan berhasil diubah menjadi "${status === 'checked' ? 'Sudah Diperiksa' : 'Belum Diperiksa'}"`);

    } catch (error) {
      console.error("Gagal update status pemeriksaan:", error);
      alert("❌ Gagal mengubah status pemeriksaan. Silakan coba lagi.");
    }
  };

  // Handle hapus data
  const handleDelete = async () => {
    if (!cowId || !selectedCow) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data suhu untuk ${selectedCow.tag}?\n\nPeringatan: Data yang dihapus tidak dapat dikembalikan!`
    );

    if (!confirmDelete) {
      setShowDeleteModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5001/api/temperature/${cowId}/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRawHistory([]);
      setFilteredHistory([]);
      setAvgData({ avg_temp: null });

      setShowDeleteModal(false);
      alert(`✅ Semua data suhu untuk ${selectedCow.tag} berhasil dihapus`);

    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("❌ Gagal menghapus data. Silakan coba lagi.");
      setShowDeleteModal(false);
    }
  };

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
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Navbar title="Suhu" cowId={cowId} cowData={selectedCow} />

      {/* Dropdown + Status Labels + Buttons */}
      {cows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Dropdown
              value={cowId}
              onChange={(val) => setCowId(Number(val))}
              options={cows.map((c) => ({ id: c.id, name: c.tag }))}
            />

            {avgCategory && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-600 font-medium">Rata-rata:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryStyles(avgCategory.color)}`}>
                  {avgCategory.label}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600 font-medium">Status:</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${selectedCow?.checkupStatus === 'checked'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                {selectedCow?.checkupStatus === 'checked' ? 'Sudah Diperiksa' : 'Belum Diperiksa'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600 font-medium">Kondisi:</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getCowConditionStyle()}`}>
                {getCowCondition()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Edit Pemeriksaan</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm font-medium">Hapus</span>
            </button>
          </div>
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

        <div className="bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
              <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
            </div>

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

              {filteredHistory.length > ITEMS_PER_PAGE && (
                <>
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
                </>
              )}
            </div>
          </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
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

      {/* Modal Edit Pemeriksaan */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-lg font-bold text-gray-800">Edit Status Pemeriksaan</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Pilih status pemeriksaan untuk sapi <span className="font-bold">{selectedCow?.tag}</span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleEditCheckup('checked')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-green-700">Sudah Diperiksa</p>
                      <p className="text-xs text-green-600">Sapi telah menjalani pemeriksaan</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleEditCheckup('unchecked')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-yellow-700">Belum Diperiksa</p>
                      <p className="text-xs text-yellow-600">Sapi belum menjalani pemeriksaan</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Data Suhu</h2>
              <p className="text-sm text-gray-600 mb-2">
                Anda akan menghapus <span className="font-bold">SEMUA</span> data suhu untuk:
              </p>
              <p className="text-lg font-bold text-red-600 mb-4">
                {selectedCow?.tag}
              </p>
              <p className="text-xs text-gray-500 mb-6">
                ⚠️ Tindakan ini tidak dapat dibatalkan!
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}