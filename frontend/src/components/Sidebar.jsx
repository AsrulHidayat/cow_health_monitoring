import { useState } from "react";
import logo from "../assets/logo.png";
import { LayoutDashboard, Home, Thermometer, HeartPulse, Activity, LogOut, XCircle } from "lucide-react";

const menus = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard" },
  { name: "Sapi", icon: <Home size={20} />, key: "sapi" },
  { name: "Suhu", icon: <Thermometer size={20} />, key: "suhu" },
  { name: "Detak Jantung", icon: <HeartPulse size={20} />, key: "detak" },
  { name: "Gerakan", icon: <Activity size={20} />, key: "gerakan" },
];

export default function Sidebar({ onSelect, onExit }) {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false); // State untuk modal logout

  const handleMenuClick = (menuKey) => {
    setActive(menuKey);
    onSelect(menuKey);
  };

  const handleExitClick = () => {
    setShowLogout(true);
  };

  const handleCloseModal = () => setShowLogout(false);

  const handleConfirmLogout = () => {
    setShowLogout(false);
    if (onExit) onExit();
    else window.location.href = "/login";
  };

  return (
    <>
      {/* Sidebar utama */}
      <div
        className={`h-screen sticky top-0 bg-white border-r-2 border-gray-200 flex flex-col items-center py-2 px-2 transition-all duration-300 ${
          isOpen ? "w-56" : "w-20"
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Logo */}
        <div className="w-full flex items-center justify-start gap-3 py-2 pl-3 mb-2 rounded-xl bg-green-100 transition-all duration-300">
          <img src={logo} alt="Logo sapi" className="w-10 h-10" />
          {isOpen && <h2 className="text-green-800 font-bold text-base">Home Health</h2>}
        </div>

        {/* Menu */}
        <div className="w-full flex flex-col gap-2 px-1 py-3 rounded-xl bg-green-100 transition-all duration-300">
          {menus.map((menu) => (
            <button
              key={menu.key}
              onClick={() => handleMenuClick(menu.key)}
              className={`flex items-center rounded-xl transition-all duration-300
                ${active === menu.key ? "bg-white shadow-md text-black" : "text-gray-500 hover:bg-green-200"}
                ${isOpen ? "gap-3 px-3 py-3 mx-1" : "justify-start py-3 px-3 mx-1"}`}
            >
              {menu.icon}
              {isOpen && <span className="text-sm font-medium">{menu.name}</span>}
            </button>
          ))}
        </div>

        {/* Tombol Keluar */}
        <div className="w-full mt-auto px-1 py-4">
          <div className="w-full bg-red-100 rounded-xl py-2 px-1">
            <button
              onClick={handleExitClick}
              className={`flex items-center w-full text-red-600 transition-all duration-300 
                rounded-lg hover:bg-red-200
                ${isOpen ? "gap-3 px-3 py-3" : "justify-start py-3 px-3"}`}
            >
              <LogOut size={20} />
              {isOpen && <span className="text-sm font-medium">Keluar</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Keluar */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeIn">
            <div className="flex flex-col items-center text-center gap-3">
              <XCircle className="text-red-500 w-12 h-12" />
              <h2 className="text-lg font-semibold text-gray-800">Keluar dari Aplikasi?</h2>
              <p className="text-sm text-gray-500">
                Anda yakin ingin keluar dari akun ini?
              </p>

              <div className="flex gap-3 mt-5 w-full">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut size={18} />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
