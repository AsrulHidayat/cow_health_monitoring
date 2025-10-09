import axios from "axios";
const API_URL = "http://localhost:5001/api/temperature";

// GET /api/temperature/:cowId/latest
export const getLatest = async (cowId) => {
  const res = await axios.get(`${API_URL}/${cowId}/latest`);
  return res.data;
};

// GET /api/temperature/:cowId/history?limit=20
export const getHistory = async (cowId, limit = 20) => {
  const res = await axios.get(`${API_URL}/${cowId}/history?limit=${limit}`);
  return res.data;
};

// GET /api/temperature/:cowId/average?minutes=60
export const getAverage = async (cowId, minutes = 60) => {
  const res = await axios.get(`${API_URL}/${cowId}/average?minutes=${minutes}`);
  return res.data;
};

// GET /api/temperature/:cowId/status
export const getSensorStatus = async (cowId) => {
  const res = await axios.get(`${API_URL}/${cowId}/status`);
  return res.data;
};

// GET /api/cows
export const getAllCows = async () => {
  const res = await axios.get(`${API_URL}/cows`); 
  return res.data; 
};