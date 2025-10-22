// Konfigurasi filter waktu
export const TIME_FILTERS = {
  FIVE_SECONDS: { value: 'five_seconds', label: 'Per 5 Detik', limit: 120, interval: 5 },
  MINUTE: { value: 'minute', label: 'Per Menit', limit: 60, interval: 1 },
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
const groupByTimeInterval = (data, minutesRange, intervalType) => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - minutesRange * 60 * 1000);

  // Menyaring data agar hanya mencakup rentang waktu tertentu
  const relevantData = data.filter(item =>
    new Date(item.fullDate || item.created_at) >= cutoffTime
  );

  if (relevantData.length === 0) return [];

  // Mengelompokkan data berdasarkan interval waktu (jam, hari, minggu, bulan, tahun)
  const grouped = {};
  relevantData.forEach(item => {
    const date = new Date(item.fullDate || item.created_at);
    let key;

    switch (intervalType) {
      case 'minute': {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
        break;
      }
      case 'hour': {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      }
      case 'day': {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      }
      case 'week': {
        const weekNum = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      }
      case 'month': {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      }
      case 'year': {
        key = `${date.getFullYear()}`;
        break;
      }
      default: {
        key = date.toISOString();
      }
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

  // Menghitung rata-rata suhu untuk setiap kelompok waktu
  return Object.values(grouped).map((group, index) => {
    const avgTemp = group.temps.reduce((sum, t) => sum + t, 0) / group.temps.length;
    const date = group.date;

    let timeLabel;
    switch (intervalType) {
      case 'minute': timeLabel = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit',}); 
        break;
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
      index: index + 1,
      displayIndex: `#${index + 1}`,
      count: group.temps.length
    };
  }).sort((a, b) => a.fullDate - b.fullDate);
};

// Fungsi untuk memfilter dan mengelompokkan data berdasarkan periode waktu
export const filterDataByTimePeriod = (data, timePeriod) => {
  if (!data || data.length === 0) return [];

  let filteredData = [...data];

  switch (timePeriod) {

    case TIME_FILTERS.FIVE_SECONDS.value:
      // Ambil 100 data terakhir = sekitar 10 menit terakhir (5 detik × 120)
      filteredData = data.slice(-100);
      break;

    case TIME_FILTERS.MINUTE.value:
      // Group rata-rata suhu per 1 menit terakhir
      filteredData = groupByTimeInterval(data, 60, 'minute');
      break;

    case TIME_FILTERS.HOUR.value: {
      // Mengelompokkan data per jam selama 7 hari terakhir
      const hoursAgo = 168;
      filteredData = groupByTimeInterval(data, hoursAgo * 60, 'hour');
      break;
    }

    case TIME_FILTERS.DAY.value:
      // Mengelompokkan data per hari selama 30 hari terakhir
      filteredData = groupByTimeInterval(data, 30 * 24 * 60, 'day');
      break;

    case TIME_FILTERS.WEEK.value:
      // Mengelompokkan data per minggu selama 52 minggu terakhir
      filteredData = groupByTimeInterval(data, 52 * 7 * 24 * 60, 'week');
      break;

    case TIME_FILTERS.MONTH.value:
      // Mengelompokkan data per bulan selama 12 bulan terakhir
      filteredData = groupByTimeInterval(data, 12 * 30 * 24 * 60, 'month');
      break;

    case TIME_FILTERS.YEAR.value:
      // Mengelompokkan data per tahun selama 5 tahun terakhir
      filteredData = groupByTimeInterval(data, 5 * 365 * 24 * 60, 'year');
      break;

    default:
      filteredData = data.slice(-25);
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