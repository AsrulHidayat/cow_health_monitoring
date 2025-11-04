// ========================================================
// 🔹 KONFIGURASI FILTER WAKTU (sama seperti activity/suhu)
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

// ========================================================
// 🔹 KATEGORI AKTIVITAS (sesuai enum database)
// ========================================================
export const ACTIVITY_CATEGORIES = [
  { label: 'Semua Aktivitas', value: 'ALL' },
  { label: 'Berbaring', value: 'Berbaring' },
  { label: 'Berdiri', value: 'Berdiri' },
  { label: 'Berjalan', value: 'Berjalan' },
];

// ========================================================
// 🔹 KATEGORI AKTIVITAS DARI NILAI activity
// ========================================================
export const categorizeActivity = (activity, activityEnum = null) => {
  // Jika database sudah punya enum aktivitas
  if (activityEnum) {
    const categoryMap = {
      Berbaring: { label: "Berbaring", color: "blue", value: "Berbaring" },
      Berdiri: { label: "Berdiri", color: "green", value: "Berdiri" },
      Berjalan: { label: "Berjalan", color: "yellow", value: "Berjalan" },
    };
    return categoryMap[activityEnum] || { label: "N/A", color: "gray", value: "na" };
  }

  // Validasi nilai magnitude (m/s²)
  if (activity == null || isNaN(activity)) {
    return { label: "N/A", color: "gray", value: "na" };
  }

  // === KLASIFIKASI BERDASARKAN NILAI MAGNITUDE (m/s²) ===
  // Estimasi:
  // - Berbaring: ~9.5–10.1 (sangat stabil, sedikit variasi)
  // - Berdiri: 8.8–9.5 atau 10.1–10.8 (ada goyangan ringan kepala)
  // - Berjalan: <8.8 atau >10.8 (pergerakan aktif kepala/leher)
  if (activity >= 9.5 && activity <= 10.1) {
    return { label: "Berbaring", color: "blue", value: "Berbaring" };
  } else if ((activity >= 8.8 && activity < 9.5) || (activity > 10.1 && activity <= 10.8)) {
    return { label: "Berdiri", color: "green", value: "Berdiri" };
  } else if (activity < 8.8 || activity > 10.8) {
    return { label: "Berjalan", color: "yellow", value: "Berjalan" };
  }

  // Fallback
  return { label: "N/A", color: "gray", value: "na" };
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
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[color] || styles.green;
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

  // Untuk activity, kita gunakan logic yang sama seperti activity
  // karena kita track activity magnitude dan activity enum secara bersamaan

  switch (timePeriod) {
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
        grouped[key].push(item);
      });

      return Object.entries(grouped).map(([minuteKey, items], index) => {
        // Hitung rata-rata activity
        const activitys = items.map(i => i.activity).filter(m => m != null);
        const avgactivity = activitys.length > 0
          ? activitys.reduce((a, b) => a + b, 0) / activitys.length
          : null;

        // Ambil aktivitas yang paling sering muncul
        const activityCounts = {};
        items.forEach(i => {
          if (i.activity) {
            activityCounts[i.activity] = (activityCounts[i.activity] || 0) + 1;
          }
        });
        const mostCommonActivity = Object.keys(activityCounts).length > 0
          ? Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0][0]
          : 'Berdiri';

        return {
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: minuteKey,
          avgActivity: avgactivity ? parseFloat(avgactivity.toFixed(1)) : null, // nilai rata-rata
          activity: mostCommonActivity, // aktivitas dominan
          fullDate: `${minuteKey}:00`,
        };
      });
    }

    default:
      return filteredData.slice(-25);
  }
};