// Konfigurasi filter waktu
export const TIME_FILTERS = {
  FIVE_SECONDS: { value: 'five_seconds', label: 'Per 5 Detik', limit: 120, interval: 5 },
  MINUTE: { value: 'minute', label: 'Per Menit', limit: 600, interval: 1 },
  HOUR: { value: 'hour', label: 'Per Jam', limit: 24 * 7, interval: 60 },
  DAY: { value: 'day', label: 'Per Hari', limit: 30, interval: 60 * 24 },
  WEEK: { value: 'week', label: 'Per Minggu', limit: 52, interval: 60 * 24 * 7 },
  MONTH: { value: 'month', label: 'Per Bulan', limit: 12, interval: 60 * 24 * 30 },
  YEAR: { value: 'year', label: 'Per Tahun', limit: 5, interval: 60 * 24 * 365 }
};

export const TEMPERATURE_CATEGORIES = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Hipotermia', value: 'hipotermia' },
  { label: 'Normal', value: 'normal' },
  { label: 'Demam Ringan', value: 'demam-ringan' },
  { label: 'Demam Tinggi', value: 'demam-tinggi' },
  { label: 'Kritis', value: 'kritis' },
];

// Fungsi bantu untuk mengelompokkan data berdasarkan interval waktu
const groupByTimeInterval = (data, minutesRange, intervalType, isDateRangeActive = false) => {
  if (!data || data.length === 0) return [];

  // Pastikan waktu sekarang dalam zona lokal
  const now = new Date();
  // Tambahkan toleransi 1 hari ke belakang untuk mencegah data hari ini terpotong
  const cutoffTime = new Date(now.getTime() - (minutesRange * 60 * 1000) - (24 * 60 * 60 * 1000));

  // Konversi semua data ke waktu lokal (Asia/Jakarta)
  const normalizeToLocal = (dateStr) => {
    const utcDate = new Date(dateStr);
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(utcDate.getTime() - offset); // ubah ke waktu lokal
  };

  // Menyaring data agar hanya mencakup rentang waktu tertentu
  const relevantData = isDateRangeActive
    ? data
    : data.filter(item =>
      normalizeToLocal(item.fullDate || item.created_at) >= cutoffTime
    );

  if (relevantData.length === 0) return [];

  // Untuk interval menit, kelompokkan data berdasarkan menit
  if (intervalType === 'minute') {
    const grouped = {};

    relevantData.forEach(item => {
      const date = normalizeToLocal(item.fullDate || item.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;

      if (!grouped[key]) {
        grouped[key] = {
          temps: [],
          date: date,
          key: key
        };
      }
      grouped[key].temps.push(item.temperature);
    });

    const mappedAndSorted = Object.values(grouped)
      .map((group) => {
        const avgTemp = group.temps.reduce((sum, t) => sum + t, 0) / group.temps.length;
        const date = group.date;
        return {
          time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          temperature: parseFloat(avgTemp.toFixed(1)),
          fullDate: date,
          count: group.temps.length
        };
      })
      .sort((a, b) => b.fullDate - a.fullDate);

    const slicedData = isDateRangeActive ? mappedAndSorted : mappedAndSorted.slice(0, 500);

    return slicedData.map((item, index) => ({
      ...item,
      index: index + 1,
      displayIndex: `#${index + 1}`
    }));
  }

  // Mengelompokkan data berdasarkan interval waktu (jam, hari, minggu, bulan, tahun)
  const grouped = {};
  relevantData.forEach(item => {
    const date = normalizeToLocal(item.fullDate || item.created_at);
    let key;

    switch (intervalType) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week': {
        const weekNum = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      }
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      case 'year':
        key = `${date.getFullYear()}`;
        break;
      default:
        key = date.toISOString();
    }

    if (!grouped[key]) {
      grouped[key] = {
        temps: [],
        date: date,
        key: key
      };
    }
    grouped[key].temps.push(item.temperature);
  });

  return Object.values(grouped)
    .map((group) => {
      const avgTemp = group.temps.reduce((sum, t) => sum + t, 0) / group.temps.length;
      const date = group.date;
      let timeLabel;

      switch (intervalType) {
        case 'hour':
          timeLabel = date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit' });
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
        temperature: parseFloat(avgTemp.toFixed(1)),
        fullDate: date,
        count: group.temps.length
      };
    })
    .sort((a, b) => b.fullDate - a.fullDate)
    .map((item, index) => ({
      ...item,
      index: index + 1,
      displayIndex: `#${index + 1}`
    }));
};

// Fungsi untuk memfilter dan mengelompokkan data berdasarkan periode waktu
export const filterDataByTimePeriod = (
  data,
  timePeriod,
  isDateRangeActive = false,
  startDate = null,
  endDate = null
) => {
  if (!data || data.length === 0) return [];

  let filteredData = [...data];

  // 1. Jika mode rentang tanggal aktif, filter dulu berdasarkan tanggal
  if (isDateRangeActive && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Pastikan tanggal akhir mencakup seluruh hari (23:59:59)
    end.setHours(23, 59, 59, 999);

    filteredData = data.filter((item) => {
      const itemDate = new Date(item.fullDate);
      return itemDate >= start && itemDate <= end;
    });
  }

  // 2. Setelah tanggal terfilter, teruskan ke logika grouping/time filter
  switch (timePeriod) {
    case TIME_FILTERS.FIVE_SECONDS.value: {
      const validData = filteredData
        .map(item => {
          const ts = new Date(item.fullDate).getTime();
          return isNaN(ts) ? null : { ...item, ts };
        })
        .filter(Boolean)
        .sort((a, b) => a.ts - b.ts); // urutkan lama → baru

      const dataToUse = isDateRangeActive ? validData : validData.slice(-100).reverse();

      filteredData = dataToUse.map((item, index) => {
        const date = new Date(item.ts);
        return {
          ...item,
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
          fullDate: date.toISOString(),
        };
      });
      break;
    }

    case TIME_FILTERS.MINUTE.value: {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 60 * 1000); // 1 jam terakhir

      // Ambil data dalam 1 jam terakhir
      const filtered = data.filter(item => {
        const t = new Date(item.fullDate);
        return t >= start && t <= now;
      });

      // 🔹 Kelompokkan data berdasarkan menit
      const grouped = {};
      filtered.forEach(item => {
        const d = new Date(item.fullDate);
        const key = `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item.temperature);
      });

      // 🔹 Hitung rata-rata tiap menit
      const averaged = Object.entries(grouped).map(([minuteKey, temps], index) => {
        const avgTemp =
          temps.reduce((acc, t) => acc + t, 0) / temps.length;

        return {
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: minuteKey, // tampil seperti "12:38"
          temperature: parseFloat(avgTemp.toFixed(1)),
          fullDate: `${minuteKey}:00`
        };
      });

      return averaged;
    }


    case TIME_FILTERS.HOUR.value: {
      const hoursAgo = 168;
      filteredData = groupByTimeInterval(filteredData, hoursAgo * 60, "hour", isDateRangeActive);
      break;
    }

    case TIME_FILTERS.DAY.value:
      filteredData = groupByTimeInterval(filteredData, 30 * 24 * 60, "day", isDateRangeActive);
      break;

    case TIME_FILTERS.WEEK.value:
      filteredData = groupByTimeInterval(filteredData, 52 * 7 * 24 * 60, "week", isDateRangeActive);
      break;

    case TIME_FILTERS.MONTH.value:
      filteredData = groupByTimeInterval(filteredData, 12 * 30 * 24 * 60, "month", isDateRangeActive);
      break;

    case TIME_FILTERS.YEAR.value:
      filteredData = groupByTimeInterval(filteredData, 5 * 365 * 24 * 60, "year", isDateRangeActive);
      break;

    default:
      filteredData = filteredData.slice(-25);
  }

  return filteredData;
};

// Fungsi untuk mengkategorikan suhu berdasarkan tingkat keparahan
export const categorizeTemperature = (temp) => {
  if (temp < 38.0) {
    return { label: 'Hipotermia', color: 'blue', value: 'hipotermia' };
  } else if (temp >= 38.0 && temp <= 39.2) {
    return { label: 'Normal', color: 'green', value: 'normal' };
  } else if (temp >= 39.3 && temp <= 40.0) {
    return { label: 'Demam Ringan', color: 'yellow', value: 'demam-ringan' };
  } else if (temp >= 40.1 && temp <= 41.0) {
    return { label: 'Demam Tinggi', color: 'orange', value: 'demam-tinggi' };
  } else if (temp > 41.0) {
    return { label: 'Kritis', color: 'red', value: 'kritis' };
  }
  return { label: 'N/A', color: 'gray', value: 'na' };
};

// Fungsi untuk menentukan gaya tampilan berdasarkan warna kategori suhu
export const getCategoryStyles = (color) => {
  const styles = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200"
  };
  return styles[color] || styles.green;
};