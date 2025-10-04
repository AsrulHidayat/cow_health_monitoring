// frontend/src/services/authService.js
import axios from "axios";

const API_URL = "/api/auth/"; // backend route kamu

// Register
const register = async (name, email, password) => {
  const response = await axios.post(API_URL + "register", {
    name,
    email,
    password,
  });
  return response.data;
};

// Login
const login = async (email, password) => {
  const response = await axios.post(API_URL + "login", { email, password });
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};

const authService = { login, register, logout };

export default authService;
