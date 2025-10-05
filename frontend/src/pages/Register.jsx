import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import authService from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama!");
      return;
    }

    try {
      await authService.register(formData.name, formData.email, formData.password);
      alert("Register berhasil, silakan login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Gagal register, periksa kembali data.");
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row h-screen">
      {/* Kolom kiri: Form Register */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center items-center bg-white px-8 py-12 lg:px-12 shadow-lg min-h-[65vh] sm:min-h-[70vh] lg:min-h-full">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide">
            REGISTER
          </h1>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Name */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
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

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </span>
            </div>

            {/* Tombol Register */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-300 ease-in-out focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            >
              Register
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            Sudah punya akun?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-600 hover:underline cursor-pointer font-medium"
            >
              Login
            </span>
          </p>
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

export default Register;
