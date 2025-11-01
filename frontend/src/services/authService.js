import axios from "axios";
const API_URL = "http://localhost:5001/api/auth/"; 

// Register
const register = async (name, email, password) => {
  const response = await axios.post(API_URL + "register", {
    name,
    email,
    password,
  });
  return response.data;
};

// Login - PERBAIKAN: Simpan token dan user data terpisah
const login = async (email, password) => {
  const response = await axios.post(API_URL + "login", { email, password });
  
  if (response.data) {
    // Simpan seluruh data user
    localStorage.setItem("user", JSON.stringify(response.data));
    
    // Simpan token terpisah untuk kemudahan akses
    localStorage.setItem("token", response.data.token);
    
    // Simpan user_id terpisah
    localStorage.setItem("user_id", response.data._id);
    
    console.log("✅ Login berhasil, data tersimpan:", {
      user_id: response.data._id,
      token: response.data.token ? "Ada" : "Tidak ada"
    });
  }
  
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
};

// Helper untuk mendapatkan token
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper untuk mendapatkan user ID
const getUserId = () => {
  return localStorage.getItem("user_id");
};

const authService = { 
  login, 
  register, 
  logout,
  getToken,
  getUserId
};

export default authService;
