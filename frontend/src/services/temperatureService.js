import axios from "axios";

const API_URL = "http://localhost:5001/api";

// Temperature endpoints
export const getLatest = async (cowId) => {
  const res = await axios.get(`${API_URL}/temperature/${cowId}/latest`);
  return res.data;
};

export const getHistory = async (cowId, limit = 20) => {
  const res = await axios.get(`${API_URL}/temperature/${cowId}/history?limit=${limit}`);
  return res.data;
};

export const getAverage = async (cowId, limit = 60) => {
  const res = await axios.get(`${API_URL}/temperature/${cowId}/average?limit=${limit}`);
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