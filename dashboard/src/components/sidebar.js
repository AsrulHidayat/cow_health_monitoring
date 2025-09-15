import { useState } from "react";
import logo from "../image/logo.png"; // p
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

  return (
    <div className="w-56 h-screen bg-green-100 flex flex-col items-center py-6 rounded-r-2xl">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-10">
        <img
          src={logo}
          alt="Home logo"
          className="w-16 h-16 mb-2"
        />
        <h2 className="text-green-800 font-bold text-lg">Home Health</h2>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {menus.map((menu) => (
          <button
            key={menu.key}
            onClick={() => {
              setActive(menu.key);
              onSelect(menu.key);
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition 
              ${
                active === menu.key
                  ? "bg-white shadow-md text-black"
                  : "text-gray-500 hover:bg-green-200"
              }`}
          >
            {menu.icon}
            <span className="text-sm font-medium">{menu.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
