import axios from 'axios';

// Tentukan URL dasar untuk API sapi Anda
const API_URL = 'http://localhost:5001/api/cows';

/**
 * Helper untuk mendapatkan token dari localStorage.
 * @returns {string|null} Token JWT
 */
const getToken = () => localStorage.getItem('token');

/**
 * Mengambil semua data sapi milik pengguna yang sedang login.
 * (GET /api/cows)
 * @returns {Promise<Array>} Array dari data sapi
 */
export const getAllCows = async () => {
  try {
    const token = getToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all cows:', error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil data sapi');
  }
};

/**
 * Mengambil data sapi publik (sesuai log Anda).
 * (GET /api/cows/public)
 * @returns {Promise<Array>} Array dari data sapi publik
 */
export const getAllCowsPublic = async () => {
  try {
    // Rute publik biasanya tidak memerlukan token
    const response = await axios.get(`${API_URL}/public`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public cows:', error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil data sapi publik');
  }
};

/**
 * Mengambil data satu sapi spesifik berdasarkan ID.
 * (GET /api/cows/:id)
 * @param {string|number} id - ID sapi
 * @returns {Promise<Object>} Objek data sapi
 */
export const getCowById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching cow with id ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal mengambil detail sapi');
  }
};

/**
 * Membuat data sapi baru.
 * (POST /api/cows)
 * @param {Object} cowData - Data sapi baru (misal: { tag, name, birthDate })
 * @returns {Promise<Object>} Objek data sapi yang baru dibuat
 */
export const createCow = async (cowData) => {
  try {
    const token = getToken();
    const response = await axios.post(API_URL, cowData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating cow:', error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal menambahkan sapi baru');
  }
};

/**
 * Memperbarui data sapi yang sudah ada.
 * (PUT /api/cows/:id)
 * @param {string|number} id - ID sapi yang akan diperbarui
 * @param {Object} cowData - Data sapi yang diperbarui
 * @returns {Promise<Object>} Objek data sapi yang telah diperbarui
 */
export const updateCow = async (id, cowData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/${id}`, cowData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating cow with id ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal memperbarui data sapi');
  }
};

/**
 * Menghapus data sapi.
 * (DELETE /api/cows/:id)
 * @param {string|number} id - ID sapi yang akan dihapus
 * @returns {Promise<Object>} Pesan sukses
 */
export const deleteCow = async (id) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting cow with id ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Gagal menghapus data sapi');
  }
};