import axios from "axios";

const API_URL = "http://localhost:5001/api/temperature";

export const getLatest = async (cowId) => {
  const res = await axios.get(`${API_URL}/latest/${cowId}`);
  return res.data;
};

export const getHistory = async (cowId, limit = 20) => {
  const res = await axios.get(`${API_URL}/${cowId}?limit=${limit}`);
  return res.data;
};

export const getAverage = async (cowId, minutes = 60) => {
  const res = await axios.get(`${API_URL}/average/${cowId}?minutes=${minutes}`);
  return res.data;
};

export const getSensorStatus = async (cowId) => {
  const res = await axios.get(`${API_URL}/data/status/${cowId}`);
  return res.data;
};