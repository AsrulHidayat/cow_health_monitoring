// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await authService.login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal login. Periksa kembali email dan password Anda.";
      setError(errorMessage);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Kolom kiri: form */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center bg-white p-10 shadow-lg">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide">
            LOGIN
          </h1>

          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            {/* Email */}
            <div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </p>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-300 ease-in-out focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            >
              Login
            </button>

            {/* Link ke Register */}
            <p className="text-sm text-gray-600 text-center mt-4">
              Belum punya akun?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-green-600 hover:underline cursor-pointer font-medium"
              >
                Daftar Sekarang
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* Kolom kanan: video */}
      <div className="hidden lg:flex w-3/4 h-full relative">
        <video
          className="w-full h-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/cow_calf.mp4" type="video/mp4" />
          Browser Anda tidak mendukung video.
        </video>

        {/* Lapisan transparan lembut di atas video */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-green-200/30" />
      </div>
    </div>
  );
};

export default Login;
