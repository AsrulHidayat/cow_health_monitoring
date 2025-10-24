// ========================================================
// 🔹 KONFIGURASI FILTER WAKTU
// ========================================================
export const TIME_FILTERS = {
  FIVE_SECONDS: { value: 'five_seconds', label: 'Per 5 Detik', limit: 120, interval: 5 },
  MINUTE: { value: 'minute', label: 'Per Menit', limit: 600, interval: 1 },
  HOUR: { value: 'hour', label: 'Per Jam', limit: 24, interval: 60 },
  DAY: { value: 'day', label: 'Per Hari', limit: 30, interval: 60 * 24 },
  WEEK: { value: 'week', label: 'Per Minggu', limit: 52, interval: 60 * 24 * 7 },
  MONTH: { value: 'month', label: 'Per Bulan', limit: 12, interval: 60 * 24 * 30 },
  YEAR: { value: 'year', label: 'Per Tahun', limit: 5, interval: 60 * 24 * 365 },
};

export const TEMPERATURE_CATEGORIES = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Hipotermia', value: 'hipotermia' },
  { label: 'Normal', value: 'normal' },
  { label: 'Demam Ringan', value: 'demam-ringan' },
  { label: 'Demam Tinggi', value: 'demam-tinggi' },
  { label: 'Kritis', value: 'kritis' },
];

// ========================================================
// 🔹 GROUPING DATA BERDASARKAN INTERVAL WAKTU
// ========================================================
const groupByTimeInterval = (data, minutesRange, intervalType, isDateRangeActive = false) => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - minutesRange * 60 * 1000);

  const parseDate = (val) => {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const relevantData = isDateRangeActive
    ? data.slice()
    : data.filter(item => {
      const dt = parseDate(item.fullDate || item.created_at);
      return dt && dt >= cutoffTime && dt <= now;
    });

  if (relevantData.length === 0) return [];

  const makeKey = (date, type) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const h = date.getHours();
    const min = date.getMinutes();
    switch (type) {
      case 'hour': return `${y}-${m}-${d}-${h}`;
      case 'day': return `${y}-${m}-${d}`;
      case 'week': {
        const weekNum = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        return `${date.getFullYear()}-W${weekNum}`;
      }
      case 'month': return `${y}-${m}`;
      case 'year': return `${y}`;
      case 'minute': return `${y}-${m}-${d}-${h}-${min}`;
      default: return date.toISOString();
    }
  };

  const grouped = {};

  relevantData.forEach(item => {
    const dt = parseDate(item.fullDate || item.created_at);
    if (!dt) return;
    const key = makeKey(dt, intervalType);
    if (!grouped[key]) grouped[key] = { temps: [], date: dt };
    const t = Number(item.temperature);
    if (!isNaN(t)) grouped[key].temps.push(t);
  });

  const result = Object.values(grouped).map(group => {
    const temps = group.temps;
    const avg = temps.length ? temps.reduce((s, v) => s + v, 0) / temps.length : null;
    const minTemp = temps.length ? Math.min(...temps) : null;
    const maxTemp = temps.length ? Math.max(...temps) : null;
    const date = group.date;
    const monthLetters = ['JA', 'F', 'M', 'A', 'M', 'JN', 'JL', 'A', 'S', 'O', 'N', 'D'];

    let timeLabel;
    switch (intervalType) {
      case 'minute':
        timeLabel = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        break;
      case 'hour':
        timeLabel = `${date.getDate()}${monthLetters[date.getMonth()]} : JAM ${date
          .getHours()
          .toString()
          .padStart(2, '0')}`;
        break;
      case 'day':
        timeLabel = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        break;
      case 'week':
        timeLabel = `W${Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`;
        break;
      case 'month':
        timeLabel = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        break;
      case 'year':
        timeLabel = date.getFullYear().toString();
        break;
      default:
        timeLabel = date.toLocaleTimeString('id-ID');
    }

    return {
      time: timeLabel,
      temperature: avg !== null ? parseFloat(avg.toFixed(1)) : null,
      minTemp: minTemp !== null ? parseFloat(minTemp.toFixed(1)) : null,
      maxTemp: maxTemp !== null ? parseFloat(maxTemp.toFixed(1)) : null,
      fullDate: date,
      count: temps.length,
    };
  });

  return result
    .sort((a, b) => b.fullDate - a.fullDate)
    .map((item, idx) => ({ ...item, index: idx + 1, displayIndex: `#${idx + 1}` }));
};

// ========================================================
// 🔹 FILTER DATA BERDASARKAN PERIODE WAKTU
// ========================================================
export const filterDataByTimePeriod = (
  data,
  timePeriod,
  isDateRangeActive = false,
  startDate = null,
  endDate = null
) => {
  if (!data || data.length === 0) return [];

  let filteredData = [...data];

  if (isDateRangeActive && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    filteredData = data.filter(item => {
      const itemDate = new Date(item.fullDate);
      return itemDate >= start && itemDate <= end;
    });
  }

  switch (timePeriod) {
    // 🔹 PER 5 DETIK
    case TIME_FILTERS.FIVE_SECONDS.value: {
      const validData = filteredData
        .map(item => {
          const ts = new Date(item.fullDate).getTime();
          return isNaN(ts) ? null : { ...item, ts };
        })
        .filter(Boolean)
        .sort((a, b) => a.ts - b.ts);

      const dataToUse = isDateRangeActive ? validData : validData.slice(-100).reverse();

      return dataToUse.map((item, index) => {
        const date = new Date(item.ts);
        return {
          ...item,
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          fullDate: date,
        };
      });
    }

    // 🔹 PER MENIT
    case TIME_FILTERS.MINUTE.value: {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 60 * 1000);
      const filtered = data.filter(item => {
        const t = new Date(item.fullDate);
        return t >= start && t <= now;
      });

      const grouped = {};
      filtered.forEach(item => {
        const d = new Date(item.fullDate);
        const key = `${d.getHours().toString().padStart(2, '0')}:${d
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(Number(item.temperature));
      });

      return Object.entries(grouped).map(([minuteKey, temps], index) => {
        const avgTemp = temps.reduce((a, t) => a + t, 0) / temps.length;
        return {
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: minuteKey,
          temperature: parseFloat(avgTemp.toFixed(1)),
          fullDate: `${minuteKey}:00`,
        };
      });
    }

    // 🔹 PER JAM / HARI / MINGGU / BULAN / TAHUN
    case TIME_FILTERS.HOUR.value:
      // Kalau user aktifkan rentang tanggal, tampilkan semua data di range itu
      if (isDateRangeActive && startDate && endDate) {
        const diffTime = new Date(endDate) - new Date(startDate);
        const diffMinutes = diffTime / (1000 * 60);
        return groupByTimeInterval(filteredData, diffMinutes, 'hour', true);
      }
      // Kalau bukan rentang tanggal, default tetap 24 jam terakhir
      return groupByTimeInterval(filteredData, 24 * 60, 'hour', false);
    case TIME_FILTERS.DAY.value:
      return groupByTimeInterval(filteredData, 30 * 24 * 60, 'day', isDateRangeActive);
    case TIME_FILTERS.WEEK.value:
      return groupByTimeInterval(filteredData, 52 * 7 * 24 * 60, 'week', isDateRangeActive);
    case TIME_FILTERS.MONTH.value:
      return groupByTimeInterval(filteredData, 12 * 30 * 24 * 60, 'month', isDateRangeActive);
    case TIME_FILTERS.YEAR.value:
      return groupByTimeInterval(filteredData, 5 * 365 * 24 * 60, 'year', isDateRangeActive);

    default:
      return filteredData.slice(-25);
  }
};

// ========================================================
// 🔹 KATEGORI SUHU
// ========================================================
export const categorizeTemperature = (temp) => {
  if (temp == null) {
    return { label: 'N/A', color: 'gray', value: 'na' };
  }
  if (temp < 37.5) {
    return { label: 'Hipotermia', color: 'blue', value: 'hipotermia' };
  } else if (temp >= 37.5 && temp <= 39.5) {
    return { label: 'Normal', color: 'green', value: 'normal' };
  } else if (temp > 39.5 && temp <= 40.5) {
    return { label: 'Demam Ringan', color: 'yellow', value: 'demam-ringan' };
  } else if (temp > 40.5 && temp <= 41.5) {
    return { label: 'Demam Tinggi', color: 'orange', value: 'demam-tinggi' };
  } else if (temp > 41.5) {
    return { label: 'Kritis', color: 'red', value: 'kritis' };
  }
  return { label: 'N/A', color: 'gray', value: 'na' };
};
// ========================================================
// 🔹 WARNA KATEGORI
// ========================================================
export const getCategoryStyles = (color) => {
  const styles = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };
  return styles[color] || styles.green;
};
