// frontend/src/components/gerakan/hooks/useActivityData.js

import { useState, useEffect, useRef } from "react";
// --- PERUBAHAN: Impor service yang TEPAT ---
import {
  getHistoryActivity,
  getActivitySensorStatus, // Nama ini sudah benar
  getActivityStats,
  getLatestActivity, // <-- KITA AKAN TAMBAHKAN INI
} from "../../../services/activityService";
import {
  TIME_FILTERS,
  filterDataByTimePeriod,
  categorizeActivity,
} from "../utils/activityUtils";

// --- PERUBAHAN: Impor store global ---
import { useCowStore } from "../../../store/cowStore"; // <-- Sesuaikan path

const ITEMS_PER_PAGE = 25;

// --- FUNGSI HELPER: Untuk memformat data ---
const formatDataPoint = (h) => ({
  time: new Date(h.timestamp || h.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  // 'activity' di file Anda adalah 'magnitude'
  activity: parseFloat(h.magnitude.toFixed(1)), 
  fullDate: h.timestamp || h.created_at,
  x: h.x,
  y: h.y,
  z: h.z,
  magnitude: h.magnitude,
  timestamp: h.timestamp || h.created_at,
});

export const useActivityData = () => {
  // --- PERUBAHAN: State 'cows' dan 'loading' diambil dari global store ---
  const { cows, loading } = useCowStore();

  const [cowId, setCowId] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  // avgData tidak digunakan di file Anda, tapi kita biarkan dulu
  const [avgData] = useState({ avg_activity: null }); 
  const [activityPercentages, setActivityPercentages] = useState({
    berdiri: 0,
    baringKanan: 0,
    baringKiri: 0,
    na: 0,
  });
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
  const selectedCow = cows.find((c) => c.id === cowId);

  // --- PERUBAHAN: useEffect ini diganti untuk MENGGUNAKAN data dari store ---
  useEffect(() => {
    if (!loading && cows.length > 0 && !cowId) {
      setCowId(cows[0].id);
    }
  }, [cows, loading, cowId]); // Bergantung pada store

  // useEffect untuk mengambil stats (tidak berubah)
  useEffect(() => {
    if (!cowId) return;

    const fetchStats = async () => {
      try {
        const stats = await getActivityStats(cowId);
        setDatePickerStats(stats);
      } catch (err) {
        console.error("❌ Gagal mengambil stats data:", err);
      }
    };
    fetchStats();
  }, [cowId]);


  // --- PERUBAHAN: useEffect ini HANYA untuk memuat RIWAYAT (dijalankan sekali) ---
  useEffect(() => {
    if (!cowId) {
      setRawHistory([]);
      setFilteredHistory([]);
      setSensorStatus("offline");
      return;
    }

    const isDateRangeMode = dateRange.startDate && dateRange.endDate;
    const currentFetchId = Date.now();
    pollingRef.current = currentFetchId;

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
        
        if (isDateRangeMode && start === end) {
            const endDateObj = new Date(end);
            endDateObj.setDate(endDateObj.getDate() + 1);
            end = endDateObj.toISOString().split("T")[0];
        }

        const histResponse = await getHistoryActivity(cowId, limit, 0, start, end);
        if (pollingRef.current !== currentFetchId) return;

        const formatted = histResponse.data.map(formatDataPoint);
        setRawHistory(formatted);

      } catch (err) {
        if (pollingRef.current === currentFetchId) {
          console.error("❌ Gagal memuat data riwayat gerakan:", err);
          setRawHistory([]);
          setFilteredHistory([]);
        }
      }
    };

    fetchHistoryData(); // Panggil sekali

  }, [cowId, timePeriod, dateRange]); // Tetap re-fetch jika filter ini berubah


  // --- PERUBAHAN: useEffect BARU untuk POLLING REALTIME (data terbaru & status) ---
  useEffect(() => {
    if (!cowId || (dateRange.startDate && dateRange.endDate)) {
      setSensorStatus("offline");
      return;
    }

    const pollLatestData = async () => {
      try {
        const statusResult = await getActivitySensorStatus(cowId);
        setSensorStatus(statusResult.status);

        if (statusResult.status === "online") {
          const latestData = await getLatestActivity(cowId); // Panggil fungsi baru
          if (latestData) {
            const formattedData = formatDataPoint(latestData);
            
            setRawHistory((prevHistory) => {
              if (prevHistory.length > 0 && prevHistory[0].fullDate === formattedData.fullDate) {
                return prevHistory;
              }
              return [formattedData, ...prevHistory];
            });
          }
        }
      } catch (err) {
        console.error("❌ Gagal polling data gerakan terbaru:", err);
        setSensorStatus("offline");
      }
    };

    pollLatestData();
    const interval = setInterval(pollLatestData, 5000); // Set interval polling

    return () => clearInterval(interval);
  }, [cowId, dateRange.startDate, dateRange.endDate]);


  // useEffect untuk filter (Logika persentase Anda SAMA, tidak diubah)
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
            const categoryInfo = categorizeActivity(item.x, item.y, item.z);
            return categoryInfo.value === filterCategory;
          });

    setFilteredHistory(categoryFilteredData);
    setTotalPages(Math.ceil(categoryFilteredData.length / ITEMS_PER_PAGE));

    if (categoryFilteredData.length > 0) {
      // ✅ Logika persentase Anda sudah benar dan dipertahankan
      const categoryCounts = categoryFilteredData.reduce(
        (acc, item) => {
          const category = categorizeActivity(item.x, item.y, item.z).value;
          if (category === "Berdiri") acc.berdiri++;
          else if (category === "Berbaring Kanan") acc.baringKanan++;
          else if (category === "Berbaring Kiri") acc.baringKiri++;
          else acc.na++;
          return acc;
        },
        { berdiri: 0, baringKanan: 0, baringKiri: 0, na: 0 }
      );

      const total = categoryFilteredData.length;
      setActivityPercentages({
        berdiri: (categoryCounts.berdiri / total) * 100,
        baringKanan: (categoryCounts.baringKanan / total) * 100,
        baringKiri: (categoryCounts.baringKiri / total) * 100,
        na: (categoryCounts.na / total) * 100,
      });
    } else {
      setActivityPercentages({
        berdiri: 0,
        baringKanan: 0,
        baringKiri: 0,
        na: 0,
      });
    }
  }, [rawHistory, timePeriod, dateRange, filterCategory, appliedTimeRange]);


  // ... (Sisa hook Anda dari baris 336 ke 422 SAMA) ...
  // useEffect untuk reset offset
  useEffect(() => {
    setDataOffset(0);
  }, [cowId, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  // useEffect untuk data display pagination
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

  // Fungsi handle pagination
  const handlePrevPage = () => {
    if (dataOffset > 0) setDataOffset(Math.max(0, dataOffset - ITEMS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (dataOffset + ITEMS_PER_PAGE < filteredHistory.length)
      setDataOffset(dataOffset + ITEMS_PER_PAGE);
  };

  const handlePageSelect = (val) => setDataOffset(Number(val));

  // Fungsi helper
  const getCowCondition = () => {
    if (!selectedCow || avgData.avg_activity == null) return "Normal";
    let abnormalSensors = 0;
    const activity = avgData.avg_activity;
    if (activity < 10 || activity > 90) abnormalSensors++;
    const heartRate = selectedCow?.heartRate;
    if (heartRate == null || heartRate < 60 || heartRate > 80)
      abnormalSensors++;
    const temp = selectedCow?.temperature;
    if (temp == null || temp < 37.5 || temp > 39.5) abnormalSensors++;
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
    activityPercentages, // <-- Anda punya ini
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