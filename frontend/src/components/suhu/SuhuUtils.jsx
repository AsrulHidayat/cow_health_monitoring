// Time filter configuration
export const TIME_FILTERS = {
  MINUTE: { value: 'minute', label: 'Per Menit', limit: 60, interval: 1 },
  HOUR: { value: 'hour', label: 'Per Jam', limit: 24 * 7, interval: 60 },
  DAY: { value: 'day', label: 'Per Hari', limit: 30, interval: 60 * 24 },
  WEEK: { value: 'week', label: 'Per Minggu', limit: 52, interval: 60 * 24 * 7 },
  MONTH: { value: 'month', label: 'Per Bulan', limit: 12, interval: 60 * 24 * 30 },
  YEAR: { value: 'year', label: 'Per Tahun', limit: 5, interval: 60 * 24 * 365 }
};

// Helper function to group data by time interval
const groupByTimeInterval = (data, minutesRange, intervalType) => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - minutesRange * 60 * 1000);

  // Filter data within time range
  const relevantData = data.filter(item =>
    new Date(item.fullDate || item.created_at) >= cutoffTime
  );

  if (relevantData.length === 0) return [];

  // Group data by interval
  const grouped = {};

  relevantData.forEach(item => {
    const date = new Date(item.fullDate || item.created_at);
    let key;

    switch (intervalType) {
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

  // Calculate average for each group
  return Object.values(grouped).map((group, index) => {
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
      index: index + 1,
      displayIndex: `#${index + 1}`,
      count: group.temps.length
    };
  }).sort((a, b) => a.fullDate - b.fullDate);
};

// Function to filter and group data based on time period
export const filterDataByTimePeriod = (data, timePeriod) => {
  if (!data || data.length === 0) return [];

  let filteredData = [...data];

  switch (timePeriod) {
    case TIME_FILTERS.MINUTE.value:
      // Last 60 minutes
      filteredData = data.slice(-60);
      break;

    case TIME_FILTERS.HOUR.value: {
      // Group by hour for last 7 days (168 hours)
      const hoursAgo = 168;
      filteredData = groupByTimeInterval(data, hoursAgo * 60, 'hour');
      break;
    }

    case TIME_FILTERS.DAY.value:
      // Group by day for last 30 days
      filteredData = groupByTimeInterval(data, 30 * 24 * 60, 'day');
      break;

    case TIME_FILTERS.WEEK.value:
      // Group by week for last 52 weeks
      filteredData = groupByTimeInterval(data, 52 * 7 * 24 * 60, 'week');
      break;

    case TIME_FILTERS.MONTH.value:
      // Group by month for last 12 months
      filteredData = groupByTimeInterval(data, 12 * 30 * 24 * 60, 'month');
      break;

    case TIME_FILTERS.YEAR.value:
      // Group by year for last 5 years
      filteredData = groupByTimeInterval(data, 5 * 365 * 24 * 60, 'year');
      break;

    default:
      filteredData = data.slice(-25);
  }

  return filteredData;
};

// Utility functions for styling
export const categorizeTemperature = (temp) => {
  if (temp < 37.5) return { label: "Hipotermia", color: "blue" };
  if (temp >= 37.5 && temp <= 39.5) return { label: "Normal", color: "green" };
  if (temp > 39.5 && temp <= 40.5) return { label: "Demam Ringan", color: "yellow" };
  if (temp > 40.5 && temp <= 41.5) return { label: "Demam Tinggi", color: "orange" };
  return { label: "Kritis", color: "red" };
};

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