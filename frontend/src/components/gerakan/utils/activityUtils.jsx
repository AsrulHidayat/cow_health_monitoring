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
// 🔹 KATEGORI AKTIVITAS (4 kategori)
// ========================================================
export const ACTIVITY_CATEGORIES = [
  { label: 'Semua Aktivitas', value: 'ALL' },
  { label: 'Berdiri', value: 'Berdiri' },
  { label: 'Berbaring Kanan', value: 'Berbaring Kanan' },
  { label: 'Berbaring Kiri', value: 'Berbaring Kiri' },
  { label: 'N/A (Tidak Normal)', value: 'N/A' },
];

// ========================================================
// 🔹 FUNGSI KLASIFIKASI AKTIVITAS - DIPERBAIKI
// ========================================================
/**
 * Mengklasifikasikan posisi sapi berdasarkan nilai akselerometer X, Y, Z
 * dengan rentang yang lebih fleksibel dan toleransi error sensor
 * @param {number} x - Nilai akselerometer sumbu X
 * @param {number} y - Nilai akselerometer sumbu Y  
 * @param {number} z - Nilai akselerometer sumbu Z
 * @returns {object} - Object berisi label, color, dan value kategori
 */
export function categorizeActivity(x, y, z) {
  // ✅ Validasi: pastikan semua nilai valid
  if ([x, y, z].some(v => v == null || isNaN(v))) {
    return { label: "N/A", color: "gray", value: "N/A" };
  }

  // ✅ Konversi ke number dan pastikan presisi 2 desimal
  x = parseFloat(Number(x).toFixed(2));
  y = parseFloat(Number(y).toFixed(2));
  z = parseFloat(Number(z).toFixed(2));

  // ===============================
  // 🐄 1️⃣ SAPI BERDIRI
  // ===============================
  if (
    x >= -1.2 && x <= 0.1 &&    
    y >= -3.0 && y <= 0.0 &&    
    z >= 10.5 && z <= 12.0      
  ) {
    return { label: "Berdiri", color: "green", value: "Berdiri" };
  }

  // ===============================
  // 😴 2️⃣ SAPI BERBARING KANAN (Posisi 1 - Agak Miring)
  // ===============================
  if (
    x >= -0.6 && x <= 0.2 &&   
    y >= 4.0 && y <= 7.2 &&     
    z >= 7.3 && z <= 11.2      
  ) {
    return { label: "Berbaring Kanan", color: "blue", value: "Berbaring Kanan" };
  }

  // ===============================
  // 😴 2b️⃣ SAPI BERBARING KANAN (Posisi 2 - Sangat Miring / Nyaris Rata)
  // ===============================
  if (
    x >= 0.0 && x <= 0.4 &&    
    y >= 9.8 && y <= 10.8 &&   
    z >= 2.8 && z <= 4.3       
  ) {
    return { label: "Berbaring Kanan", color: "blue", value: "Berbaring Kanan" };
  }

  // ===============================
  // 😴 3️⃣ SAPI BERBARING KIRI (Posisi 1 - Agak Miring)
  // ===============================
  if (
    x >= -0.6 && x <= 0.2 &&   
    y >= -10.2 && y <= -6.3 &&  
    z >= 5.3 && z <= 8.7        
  ) {
    return { label: "Berbaring Kiri", color: "cyan", value: "Berbaring Kiri" };
  }

  // ===============================
  // 😴 3b️ SAPI BERBARING KIRI (Posisi 2 - Sangat Miring / Nyaris Rata)
  // ===============================
  if (
    x >= 0.2 && x <= 0.8 &&      
    y >= -10.8 && y <= -9.6 &&   
    z >= -0.1 && z <= 2.7        
  ) {
    return { label: "Berbaring Kiri", color: "cyan", value: "Berbaring Kiri" };
  }

  // ===============================
  // 🔄 4️⃣ DETEKSI TAMBAHAN BERDASARKAN DOMINASI SUMBU
  // ===============================
  // Logika fallback ini tetap penting sebagai jaring pengaman
  
  // Jika Z dominan tinggi (>9) dan Y kecil = kemungkinan berdiri
  if (z > 9.0 && Math.abs(y) < 4.0) {
    return { label: "Berdiri", color: "green", value: "Berdiri" };
  }
  
  // Jika Y positif dominan (>4) = kemungkinan berbaring kanan
  // Batas Z disesuaikan agar tidak tumpang tindih dengan blok 2b
  if (y > 4.0 && z > 4.3) { 
    return { label: "Berbaring Kanan", color: "blue", value: "Berbaring Kanan" };
  }
  
  // Jika Y negatif dominan (<-6) = kemungkinan berbaring kiri  
  // Batas Z disesuaikan agar tidak tumpang tindih dengan blok 3b
  if (y < -6.0 && z > 2.7) { 
    return { label: "Berbaring Kiri", color: "cyan", value: "Berbaring Kiri" };
  }

  // ===============================
  // ❔ 5️⃣ TIDAK TERDETEKSI / TRANSISI
  // ===============================
  return { label: "N/A", color: "gray", value: "N/A" };
}

// ========================================================
// 🔹 WARNA KATEGORI
// ========================================================
export const getCategoryStyles = (color) => {
  const styles = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[color] || styles.green;
};

// ========================================================
// 🔹 WARNA UNTUK DOT DAN CHART
// ========================================================
export const getCategoryColor = (label) => {
  const colorMap = {
    'Berdiri': '#22C55E',
    'Berbaring Kanan': '#3B82F6',
    'Berbaring Kiri': '#06B6D4',
    'N/A': '#6B7280',
  };
  return colorMap[label] || '#8B5CF6';
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
        const category = categorizeActivity(item.x, item.y, item.z);
        
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
          activityLabel: category.label,
          activityColor: getCategoryColor(category.label),
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
        const magnitudes = items.map(i => i.magnitude).filter(m => m != null);
        const avgMagnitude = magnitudes.length > 0
          ? magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length
          : null;

        const activityCounts = {};
        items.forEach(i => {
          const cat = categorizeActivity(i.x, i.y, i.z);
          activityCounts[cat.value] = (activityCounts[cat.value] || 0) + 1;
        });
        
        const mostCommonActivity = Object.keys(activityCounts).length > 0
          ? Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0][0]
          : 'N/A';

        return {
          index: index + 1,
          displayIndex: `#${index + 1}`,
          time: minuteKey,
          magnitude: avgMagnitude ? parseFloat(avgMagnitude.toFixed(1)) : null,
          activityLabel: mostCommonActivity,
          activityColor: getCategoryColor(mostCommonActivity),
          fullDate: `${minuteKey}:00`,
        };
      });
    }

    default:
      return filteredData.slice(-25);
  }
}