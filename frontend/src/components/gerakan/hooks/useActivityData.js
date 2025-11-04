import { useState, useEffect, useRef } from "react";
import { getAllCows } from "../../../services/temperatureService";
import {
  getHistoryActivity,
  getActivitySensorStatus,
  getActivityStats,
} from "../../../services/activityService";
import {
  TIME_FILTERS,
  filterDataByTimePeriod,
  categorizeActivity,
} from "../utils/activityUtils";

const ITEMS_PER_PAGE = 25;

export const useActivityData = () => {
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [avgData, setAvgData] = useState({ avg_activity: null });
  const [sensorStatus, setSensorStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchCows = async () => {
      try {
        setLoading(true);
        const allCows = await getAllCows();
        console.log("🐄 Fetched cows:", allCows.length);
        setCows(allCows);
        if (allCows.length > 0) {
          setCowId(allCows[0].id);
          console.log(
            "✅ Selected first cow:",
            allCows[0].tag,
            "ID:",
            allCows[0].id
          );
        }
      } catch (err) {
        console.error("❌ Gagal mengambil data sapi:", err);
        setCows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCows();
  }, []);

  useEffect(() => {
    if (!cowId) return;

    const fetchStats = async () => {
      try {
        console.log("📊 Fetching activity stats for cow:", cowId);
        const stats = await getActivityStats(cowId);
        setDatePickerStats(stats);
      } catch (err) {
        console.error("❌ Gagal mengambil stats data:", err);
      }
    };
    fetchStats();
  }, [cowId]);

  useEffect(() => {
    if (!cowId) {
      console.log("⚠️ No cow selected, resetting data");
      setRawHistory([]);
      setFilteredHistory([]);
      setAvgData({ avg_activity: null });
      setSensorStatus("offline");
      return;
    }

    const isDateRangeMode = dateRange.startDate && dateRange.endDate;
    const currentPollId = Date.now();
    pollingRef.current = currentPollId;

    const pollData = async () => {
      try {
        if (pollingRef.current !== currentPollId) return;

        console.log("🔍 Checking sensor status for cow:", cowId);
        const statusResult = await getActivitySensorStatus(cowId);

        if (pollingRef.current !== currentPollId) return;

        console.log(
          "📡 Sensor status:",
          statusResult.status,
          statusResult.seconds_ago ? `(${statusResult.seconds_ago}s ago)` : ""
        );
        setSensorStatus(statusResult.status);

        if (statusResult.status !== "online" && !isDateRangeMode) {
          console.log("⚠️ Sensor offline, clearing data");
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_activity: null });
          return;
        }

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
          console.log(
            `📥 Fetching latest ${limit} activity records for cow:`,
            cowId
          );
          const histResponse = await getHistoryActivity(cowId, limit, 0);

          if (pollingRef.current !== currentPollId) return;

          console.log(
            "✅ Received activity data:",
            histResponse.data?.length || 0,
            "records"
          );

          // ===================================
          //  BAGIAN INI SUDAH BENAR 
          // ===================================
          formatted = histResponse.data.map((h) => ({
            // Data untuk tabel
            time: new Date(h.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            activity: parseFloat(h.magnitude.toFixed(1)),
            fullDate: h.timestamp,
            // Data untuk grafik
            x: h.x,
            y: h.y,
            z: h.z,
            magnitude: h.magnitude,
            timestamp: h.timestamp,
          }));
          // ===================================

          setRawHistory(formatted);
          return;
        }

        if (start === end) {
          const endDateObj = new Date(end);
          endDateObj.setDate(endDateObj.getDate() + 1);
          end = endDateObj.toISOString().split("T")[0];
        }

        console.log(
          `📥 Fetching activity data from ${start} to ${end} for cow:`,
          cowId
        );
        const histResponse = await getHistoryActivity(
          cowId,
          limit,
          0,
          start,
          end
        );

        if (pollingRef.current !== currentPollId) return;

        console.log(
          "✅ Received date-filtered activity data:",
          histResponse.data?.length || 0,
          "records"
        );
        
        // ===================================
        //  BAGIAN INI JUGA SUDAH BENAR 
        // ===================================
        formatted = histResponse.data.map((h) => ({
          // Data untuk tabel
          time: new Date(h.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          activity: parseFloat(h.magnitude.toFixed(1)),
          fullDate: h.timestamp,
          // Data untuk grafik
          x: h.x,
          y: h.y,
          z: h.z,
          magnitude: h.magnitude,
          timestamp: h.timestamp,
        }));
        // ===================================

        setRawHistory(formatted);
      } catch (err) {
        if (pollingRef.current === currentPollId) {
          console.error("❌ Gagal melakukan polling data:", err);
          setSensorStatus("offline");
          setRawHistory([]);
          setFilteredHistory([]);
          setAvgData({ avg_activity: null });
        }
      }
    };

    pollData();

    if (!isDateRangeMode) {
      console.log("🔄 Starting polling interval (5s) for cow:", cowId);
      const interval = setInterval(pollData, 5000);
      return () => {
        console.log("⏹️ Stopping polling interval");
        clearInterval(interval);
      };
    }
  }, [cowId, timePeriod, dateRange]);

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
            const categoryInfo = categorizeActivity(item.activity);
            return categoryInfo.value === filterCategory;
          });

    console.log("📊 Filtered data:", categoryFilteredData.length, "records");

    setFilteredHistory(categoryFilteredData);
    setTotalPages(Math.ceil(categoryFilteredData.length / ITEMS_PER_PAGE));

    if (categoryFilteredData.length > 0) {
      const sum = categoryFilteredData.reduce(
        (acc, item) => acc + item.activity,
        0
      );
      const avg = sum / categoryFilteredData.length;
      console.log("📈 Average activity:", avg.toFixed(1));
      setAvgData({ avg_activity: avg });
    } else {
      setAvgData({ avg_activity: null });
    }
  }, [rawHistory, timePeriod, dateRange, filterCategory, appliedTimeRange]);

  useEffect(() => {
    setDataOffset(0);
  }, [cowId, timePeriod, dateRange, filterCategory, appliedTimeRange]);

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

  const handlePrevPage = () => {
    if (dataOffset > 0) setDataOffset(Math.max(0, dataOffset - ITEMS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (dataOffset + ITEMS_PER_PAGE < filteredHistory.length)
      setDataOffset(dataOffset + ITEMS_PER_PAGE);
  };

  const handlePageSelect = (val) => setDataOffset(Number(val));

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
    cows,
    cowId,
    setCowId,
    selectedCow,
    loading,
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
    setCows,
  };
};