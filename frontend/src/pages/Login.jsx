import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import authService from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggle password
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
    <div className="flex flex-col-reverse lg:flex-row h-screen">
      {/* Kolom kiri: Form Login */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center items-center bg-white px-8 py-12 lg:px-12 shadow-lg min-h-[65vh] sm:min-h-[70vh] lg:min-h-full">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide">
            LOGIN
          </h1>

          <form onSubmit={handleLogin} className="w-full space-y-4">
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </span>
            </div>

            {/* Error */}
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

      {/* Kolom kanan: Video */}
      <div className="w-full lg:w-3/4 h-[50vh] sm:h-[65vh] md:h-[70vh] lg:h-full relative overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-green-200/30" />
      </div>
    </div>
  );
};

export default Login;
