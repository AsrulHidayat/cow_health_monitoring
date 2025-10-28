import { useState, useEffect, useRef } from "react";
import {
  getHistory,
  getSensorStatus,
  getAllCows,
  getTemperatureStats,
} from "../../../services/temperatureService";
import {
  TIME_FILTERS,
  filterDataByTimePeriod,
  categorizeTemperature,
} from "../utils/SuhuUtils";

const ITEMS_PER_PAGE = 25;

export const useTemperatureData = () => {
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
          : TIME_FILTERS[
              Object.keys(TIME_FILTERS).find(
                (key) => TIME_FILTERS[key].value === timePeriod
              )
            ]?.limit || 500;

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
