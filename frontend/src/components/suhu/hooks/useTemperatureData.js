import { useState, useEffect, useRef } from "react";
import {
  getHistory,
  getSensorStatus,
  getTemperatureStats,
  getLatestTemperature, // <-- PASTIKAN ANDA MEMBUAT FUNGSI INI DI SERVICE
} from "../../../services/temperatureService";
import {
  TIME_FILTERS,
  filterDataByTimePeriod,
  categorizeTemperature,
} from "../utils/SuhuUtils";
// --- PERUBAHAN: Impor store global ---
import { useCowStore } from "../../../store/cowStore"; // <-- Sesuaikan path ke store Anda

const ITEMS_PER_PAGE = 25;

// --- FUNGSI HELPER: Untuk memformat data (agar tidak duplikat kode) ---
const formatDataPoint = (data) => ({
  time: new Date(data.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  temperature: parseFloat(data.temperature.toFixed(1)),
  fullDate: data.created_at,
});

export const useTemperatureData = () => {
  // --- PERUBAHAN: State 'cows' dan 'loading' diambil dari global store ---
  const { cows, loading } = useCowStore();

  const [cowId, setCowId] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [avgData, setAvgData] = useState({ avg_temp: null });
  const [sensorStatus, setSensorStatus] = useState("checking");
  const [timePeriod, setTimePeriod] = useState(TIME_FILTERS.MINUTE.value);
  const [dataOffset, setDataOffset] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [datePickerStats, setDatePickerStats] = useState(null);
  const [appliedTimeRange, setAppliedTimeRange] = useState({
    startTime: "00:00",
    endTime: "23:59",
  });
  const [filterCategory, setFilterCategory] = useState("ALL");

  const pollingRef = useRef(null);
  const selectedCow = cows.find((cow) => cow.id === cowId);

  // --- PERUBAHAN: useEffect ini diganti untuk MENGGUNAKAN data dari store ---
  // (useEffect yang lama dihapus)
  useEffect(() => {
    // Atur cowId awal HANYA JIKA data sapi sudah dimuat dari store
    if (!loading && cows.length > 0 && !cowId) {
      setCowId(cows[0].id);
    }
  }, [cows, loading, cowId]); // Bergantung pada store

  // useEffect untuk mengambil stats (tidak berubah)
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

  // --- PERUBAHAN: useEffect ini HANYA untuk memuat RIWAYAT (dijalankan sekali) ---
  // (Interval polling dihapus dari sini)
  useEffect(() => {
    if (!cowId) {
      setRawHistory([]);
      setFilteredHistory([]);
      setAvgData({ avg_temp: null });
      setSensorStatus("offline");
      return;
    }

    const isDateRangeMode = dateRange.startDate && dateRange.endDate;
    const currentFetchId = Date.now(); // Ganti nama ref
    pollingRef.current = currentFetchId;

    // Ganti nama fungsi 'pollData' menjadi 'fetchHistoryData'
    const fetchHistoryData = async () => {
      try {
        if (pollingRef.current !== currentFetchId) return;

        const limit = isDateRangeMode
          ? 10000
          : TIME_FILTERS[
              Object.keys(TIME_FILTERS).find(
                (key) => TIME_FILTERS[key].value === timePeriod
              )
            ]?.limit || 500;

        let start = dateRange.startDate;
        let end = dateRange.endDate;
        let formatted = [];

        if (!start || !end) {
          // Mode non-rentang tanggal (realtime)
          const histResponse = await getHistory(cowId, limit, 0);
          if (pollingRef.current !== currentFetchId) return;
          formatted = histResponse.data.map(formatDataPoint);
        } else {
          // Mode rentang tanggal
          if (start === end) {
            const endDateObj = new Date(end);
            endDateObj.setDate(endDateObj.getDate() + 1);
            end = endDateObj.toISOString().split("T")[0];
          }
          const histResponse = await getHistory(cowId, limit, 0, start, end);
          if (pollingRef.current !== currentFetchId) return;
          formatted = histResponse.data.map(formatDataPoint);
        }
        
        setRawHistory(formatted);

      } catch (err) {
        if (pollingRef.current === currentFetchId) {
          console.error("Gagal memuat data riwayat:", err);
          // Hapus setSensorStatus dari sini
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_temp: null });
        }
      }
    };

    fetchHistoryData(); // Panggil sekali

  }, [cowId, timePeriod, dateRange]); // Tetap re-fetch jika filter ini berubah


  // --- PERUBAHAN: useEffect BARU untuk POLLING REALTIME (data terbaru & status) ---
  useEffect(() => {
    if (!cowId || (dateRange.startDate && dateRange.endDate)) {
      // Jangan polling jika tidak ada cowId atau jika dalam mode rentang tanggal
      setSensorStatus("offline"); // Set status offline jika dalam mode rentang tanggal
      return;
    }

    const pollLatestData = async () => {
      try {
        // 1. Selalu cek status sensor
        const statusResult = await getSensorStatus(cowId);
        setSensorStatus(statusResult.status);

        // 2. Jika online, ambil data TERBARU
        if (statusResult.status === "online") {
          const latestData = await getLatestTemperature(cowId);
          if (latestData) {
            const formattedData = formatDataPoint(latestData);
            
            // 3. Tambahkan data terbaru ke 'rawHistory'
            setRawHistory((prevHistory) => {
              // Cek duplikat berdasarkan fullDate (timestamp)
              if (prevHistory.length > 0 && prevHistory[0].fullDate === formattedData.fullDate) {
                return prevHistory;
              }
              return [formattedData, ...prevHistory];
            });
          }
        }
      } catch (err) {
        console.error("Gagal polling data terbaru:", err);
        setSensorStatus("offline");
      }
    };

    pollLatestData(); // Panggil sekali saat dimuat
    const interval = setInterval(pollLatestData, 5000); // Set interval polling

    return () => clearInterval(interval); // Bersihkan interval
  }, [cowId, dateRange.startDate, dateRange.endDate]); // Bergantung pada cowId & mode rentang tanggal


  // useEffect untuk filter (tidak berubah)
  useEffect(() => {
    const isDateRangeMode = dateRange.startDate && dateRange.endDate;

    let baseData =
      rawHistory.length > 0
        ? filterDataByTimePeriod(
            rawHistory,
            timePeriod,
            isDateRangeMode,
            dateRange.startDate,
            dateRange.endDate
          )
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
      const sum = categoryFilteredData.reduce(
        (acc, item) => acc + item.temperature,
        0
      );
      setAvgData({ avg_temp: sum / categoryFilteredData.length });
    } else {
      setAvgData({ avg_temp: null });
    }
  }, [rawHistory, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  // useEffect untuk reset offset (tidak berubah)
  useEffect(() => {
    setDataOffset(0);
  }, [cowId, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  // useEffect untuk data display pagination (tidak berubah)
  useEffect(() => {
    if (filteredHistory.length > 0) {
      const startIndex = dataOffset;
      const endIndex = Math.min(
        filteredHistory.length,
        startIndex + ITEMS_PER_PAGE
      );
      setDisplayedData(filteredHistory.slice(startIndex, endIndex));
    } else {
      setDisplayedData([]);
    }
  }, [filteredHistory, dataOffset]);

  // Fungsi handle pagination (tidak berubah)
  const handlePrevPage = () => {
    if (dataOffset > 0) setDataOffset(Math.max(0, dataOffset - ITEMS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (dataOffset + ITEMS_PER_PAGE < filteredHistory.length)
      setDataOffset(dataOffset + ITEMS_PER_PAGE);
  };

  const handlePageSelect = (val) => setDataOffset(Number(val));

  // Fungsi helper (tidak berubah)
  const getCowCondition = () => {
    if (!selectedCow || avgData.avg_temp == null) return "Normal";
    let abnormalSensors = 0;
    const temp = avgData.avg_temp;
    if (temp < 37.5 || temp > 39.5) abnormalSensors++;
    const heartRate = selectedCow?.heartRate;
    if (heartRate == null || heartRate < 60 || heartRate > 80)
      abnormalSensors++;
    const activity = selectedCow?.activity;
    if (activity == null || activity === "inactive" || activity === "abnormal")
      abnormalSensors++;
    if (abnormalSensors === 0) return "Normal";
    if (abnormalSensors === 1) return "Perlu Diperhatikan";
    if (abnormalSensors === 2) return "Harus Diperhatikan";
    return "Segera Tindaki";
  };

  const getCowConditionStyle = () => {
    const condition = getCowCondition();
    const styles = {
      Normal: "bg-green-100 text-green-700 border border-green-200",
      "Perlu Diperhatikan":
        "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "Harus Diperhatikan":
        "bg-orange-100 text-orange-700 border border-orange-200",
      "Segera Tindaki": "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[condition] || styles["Normal"];
  };

  return {
    cows, // <-- dari store
    cowId,
    setCowId,
    selectedCow,
    loading, // <-- dari store
    sensorStatus,
    avgData,
    filteredHistory,
    displayedData,
    dateRange,
    setDateRange,
    appliedTimeRange,
    setAppliedTimeRange,
    datePickerStats,
    timePeriod,
    setTimePeriod,
    filterCategory,
    setFilterCategory,
    dataOffset,
    totalPages,
    handlePrevPage,
    handleNextPage,
    handlePageSelect,
    getCowCondition,
    getCowConditionStyle,
    ITEMS_PER_PAGE,
    // --- PERUBAHAN: setCows dihapus ---
    // setCows, 
  };
};