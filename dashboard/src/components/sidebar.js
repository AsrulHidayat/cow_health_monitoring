import { useState } from "react";
import logo from "../image/logo.png"; 
import { LayoutDashboard, Home, Thermometer, HeartPulse, Activity } from "lucide-react";

const menus = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard" },
  { name: "Sapi", icon: <Home size={20} />, key: "sapi" },
  { name: "Suhu", icon: <Thermometer size={20} />, key: "suhu" },
  { name: "Detak Jantung", icon: <HeartPulse size={20} />, key: "detak" },
  { name: "Gerakan", icon: <Activity size={20} />, key: "gerakan" },
];

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (menuKey) => {
    if (menuKey === active) {
      // kalau klik menu yang sama → toggle sidebar
      setIsOpen(!isOpen);
    } else {
      // kalau klik menu beda → pindah halaman & buka sidebar
      setActive(menuKey);
      setIsOpen(true);
      onSelect(menuKey);
    }
  };

  return (
    <div
      className={`${
        isOpen ? "w-52" : "w-20"
      } h-screen bg-white border-2 border-gray-200 flex flex-col items-center py-4 px-2 transition-all duration-300`}
    >
      {/* Logo + Judul */}
      <div className="w-full bg-green-100 flex flex-row items-center gap-3 py-2 px-2 mb-2 rounded-xl">
        <img src={logo} alt="Logo sapi" className="w-10 h-10" />
        {isOpen && <h2 className="text-green-800 font-bold text-base">Home Health</h2>}
      </div>

      {/* Menu Items */}
      <div className="w-full bg-green-100 flex flex-col gap-2 px-2 py-2 rounded-xl">
        {menus.map((menu) => (
          <button
            key={menu.key}
            onClick={() => handleMenuClick(menu.key)}
            className={`flex items-center ${
              isOpen ? "gap-3 px-3" : "px-3 justify-start"
            } py-2 rounded-xl transition text-left
              ${
                active === menu.key
                  ? "bg-white shadow-md text-black"
                  : "text-gray-500 hover:bg-green-200"
              }`}
          >
            {menu.icon}
            {isOpen && <span className="text-sm font-medium">{menu.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
