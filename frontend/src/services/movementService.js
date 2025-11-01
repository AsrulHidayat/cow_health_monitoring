import axios from "axios";

const API_URL = "http://localhost:5001/api";

const movementApi = axios.create({
  baseURL: `${API_URL}/movement`,
});

// Helper untuk menambahkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Ambil data gerakan terbaru
export const getLatestMovement = async (cowId) => {
  try {
    const res = await movementApi.get(`/${cowId}/latest`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching latest movement:", err);
    throw err;
  }
};

// Ambil riwayat data gerakan (dengan pagination/filter)
export const getHistoryMovement = async (
  cowId,
  limit = 500,
  offset = 0,
  startDate = null,
  endDate = null
) => {
  try {
    const params = { limit, offset };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await movementApi.get(`/${cowId}/history`, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching history movement:", err);
    throw err;
  }
};

// Ambil status sensor gerakan
export const getMovementSensorStatus = async (cowId) => {
  try {
    const res = await movementApi.get(`/${cowId}/status`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching movement sensor status:", err);
    throw err;
  }
};

// Get movement statistics
export const getMovementStats = async (cowId, startDate = null, endDate = null) => {
  let url = `/${cowId}/stats`;
  
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const res = await movementApi.get(url, { headers: getAuthHeaders() });
  return res.data;
};

// Hapus semua data gerakan untuk seekor sapi
export const deleteAllMovementData = async (cowId) => {
  try {
    const res = await movementApi.delete(`/${cowId}/all`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting movement data:", err);
    throw err;
  }
};