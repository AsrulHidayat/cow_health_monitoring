import axios from "axios";

const API_URL = "http://localhost:5001/api";

const activityApi = axios.create({
  baseURL: `${API_URL}/activity`,
});

// Helper untuk menambahkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Ambil data aktivitas terbaru
export const getLatestActivity = async (cowId) => {
  try {
    const res = await activityApi.get(`/${cowId}/latest`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching latest activity:", err);
    throw err;
  }
};

// Ambil riwayat data aktivitas (dengan pagination/filter)
export const getHistoryActivity = async (
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

    const res = await activityApi.get(`/${cowId}/history`, {
      params,
      headers: getAuthHeaders(),
    });

    console.log(
      `✅ Activity history fetched: ${res.data.data?.length || 0} records`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching history activity:", err);
    throw err;
  }
};

// Ambil status sensor aktivitas
export const getActivitySensorStatus = async (cowId) => {
  try {
    const res = await activityApi.get(`/${cowId}/status`, {
      headers: getAuthHeaders(),
    });

    console.log(
      `✅ Activity sensor status for cow ${cowId}:`,
      res.data.status,
      `(${res.data.seconds_ago || "?"}s ago)`
    );

    return res.data;
  } catch (err) {
    console.error("Error fetching activity sensor status:", err);
    throw err;
  }
};

// Get activity statistics
export const getActivityStats = async (cowId, startDate = null, endDate = null) => {
  try {
    // Siapkan params
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await activityApi.get(`/${cowId}/stats`, { params, headers: getAuthHeaders(),});

    console.log(`✅ Activity stats fetched for cow ${cowId}:`, res.data);
    return res.data;
  } catch (err) {
    console.error("Error fetching activity stats:", err);
    throw err;
  }
};

// Hapus semua data aktivitas untuk seekor sapi
export const deleteAllActivityData = async (cowId) => {
  try {
    const res = await activityApi.delete(`/${cowId}/all`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting activity data:", err);
    throw err;
  }
};
