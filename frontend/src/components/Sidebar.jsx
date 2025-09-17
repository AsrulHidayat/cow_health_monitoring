import { useState } from "react";
import logo from "../assets/logo.png"; 
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
    setActive(menuKey);
    onSelect(menuKey);
  };

  return (
    <div
      className={`h-screen sticky top-0 bg-white border-2 border-gray-200 flex flex-col items-center py-2 px-2 transition-all duration-300 ${
        isOpen ? "w-56" : "w-20"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Logo + Judul */}
      <div className="w-full flex flex-row items-center justify-start gap-3 py-2 pl-3 mb-2 rounded-xl bg-green-100 transition-all duration-300">
        <img src={logo} alt="Logo sapi" className="w-10 h-10" />
        {isOpen && <h2 className="text-green-800 font-bold text-base">Home Health</h2>}
      </div>

      {/* Menu Items */}
      <div className="w-full flex flex-col gap-2 px-1 py-2 rounded-xl bg-green-100 transition-all duration-300">
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
    </div>
  );
}
