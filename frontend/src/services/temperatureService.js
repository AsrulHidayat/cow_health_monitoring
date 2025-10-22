import axios from "axios";

const API_URL = "http://localhost:5001/api";

// Temperature endpoints
export const getLatest = async (cowId) => {
  const res = await axios.get(`${API_URL}/temperature/${cowId}/latest`);
  return res.data;
};

// Get history dengan pagination dan filter tanggal
export const getHistory = async (cowId, limit = 500, offset = 0, startDate = null, endDate = null) => {
  let url = `${API_URL}/temperature/${cowId}/history?limit=${limit}&offset=${offset}`;
  
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  if (endDate) {
    url += `&endDate=${endDate}`;
  }
  
  const res = await axios.get(url);
  return res.data;
};

// Get temperature by date range
export const getTemperatureByDateRange = async (cowId, startDate, endDate) => {
  const res = await axios.get(
    `${API_URL}/temperature/${cowId}/range?startDate=${startDate}&endDate=${endDate}`
  );
  return res.data;
};

// Get temperature statistics
export const getTemperatureStats = async (cowId, startDate = null, endDate = null) => {
  let url = `${API_URL}/temperature/${cowId}/stats`;
  
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const res = await axios.get(url);
  return res.data;
};

export const getAverage = async (cowId, limit = 60, startDate = null, endDate = null) => {
  let url = `${API_URL}/temperature/${cowId}/average?limit=${limit}`;
  
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  if (endDate) {
    url += `&endDate=${endDate}`;
  }
  
  const res = await axios.get(url);
  return res.data;
};

export const getSensorStatus = async (cowId) => {
  const res = await axios.get(`${API_URL}/temperature/${cowId}/status`);
  return res.data;
};

// Cow endpoints
export const getAllCows = async () => {
  try {
    const res = await axios.get(`${API_URL}/cows/public`);
    return res.data;
  } catch (error) {
    console.error("Error fetching cows:", error);
    return [];
  }
};

export const getCowsWithAuth = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/cows`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching cows with auth:", error);
    return [];
  }
};

// Dashboard endpoints
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/cows/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

export const getAllCowsPublic = async () => {
  const res = await axios.get(`${API_URL}/cows/public`);
  return res.data;
};

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/cows/dashboard/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};