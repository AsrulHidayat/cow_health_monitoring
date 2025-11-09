// frontend/src/services/temperatureService.js
import axios from "axios";

const API_URL = "http://localhost:5001/api";

/**
 * Helper untuk mengambil token dari localStorage
 */
const getToken = () => localStorage.getItem("token");

/**
 * Mengambil data suhu TERBARU untuk satu sapi.
 * (GET /api/temperature/:cowId/latest)
 */
export const getLatestTemperature = async (cowId) => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/temperature/${cowId}/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching latest temperature for cow ${cowId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil data suhu terbaru');
  }
};

/**
 * Get history dengan pagination dan filter tanggal
 * (GET /api/temperature/:cowId/history)
 */
export const getHistory = async (cowId, limit = 500, offset = 0, startDate = null, endDate = null) => {
  try {
    const token = getToken();
    let url = `${API_URL}/temperature/${cowId}/history?limit=${limit}&offset=${offset}`;
    
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching temperature history for cow ${cowId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil riwayat suhu');
  }
};

/**
 * Get temperature by date range
 * (GET /api/temperature/:cowId/range)
 */
export const getTemperatureByDateRange = async (cowId, startDate, endDate) => {
  try {
    const token = getToken();
    const res = await axios.get(
      `${API_URL}/temperature/${cowId}/range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Error fetching temperature by range for cow ${cowId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil suhu berdasarkan rentang');
  }
};

/**
 * Get temperature statistics
 * (GET /api/temperature/:cowId/stats)*/
export const getTemperatureStats = async (cowId, startDate = null, endDate = null) => {
  try {
    const token = getToken();
    let url = `${API_URL}/temperature/${cowId}/stats`;
    
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching temperature stats for cow ${cowId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil statistik suhu');
  }
};

/**
 * Get temperature average
 * (GET /api/temperature/:cowId/average)
 */
export const getAverage = async (cowId, limit = 60, startDate = null, endDate = null) => {
  try {
    const token = getToken();
    let url = `${API_URL}/temperature/${cowId}/average?limit=${limit}`;
    
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching temperature average for cow ${cowId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil rata-rata suhu');
  }
};

/**
 * Get sensor status
 * (GET /api/temperature/:cowId/status)
 */
export const getSensorStatus = async (cowId) => {
  try {
    const token = getToken();
    const res = await axios.get(`${API_URL}/temperature/${cowId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching sensor status for cow ${cowId}:`, error.response?.data || error.message);
    return { status: 'offline', message: 'Error checking sensor', error };
  }
};