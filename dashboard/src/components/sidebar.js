import { useState } from "react";
import logo from "../image/logo.png"; 
import { LayoutDashboard, Home, Thermometer, HeartPulse, Activity, Menu } from "lucide-react";

const menus = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, key: "dashboard" },
  { name: "Sapi", icon: <Home size={20} />, key: "sapi" },
  { name: "Suhu", icon: <Thermometer size={20} />, key: "suhu" },
  { name: "Detak Jantung", icon: <HeartPulse size={20} />, key: "detak" },
  { name: "Gerakan", icon: <Activity size={20} />, key: "gerakan" },
];

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(true); // state toggle mini/full

  return (
    <div
      className={`${
        isOpen ? "w-56" : "w-20"
      } h-screen bg-white border-2 border-gray-200 flex flex-col items-center py-4 px-2 transition-all duration-300`}
    >

      {/* Logo + Toggle Button */}
      <div
        className={`w-full bg-green-100 flex ${
          isOpen ? "flex-col items-center" : "flex-col items-center"
        } py-2 mb-2 rounded-xl relative`}
      >

      <img 
        src={logo} 
        alt="Logo sapi" 
        className="w-10 h-10 mb-2" 
      />

        {isOpen && <h2 className="text-green-800 font-bold text-lg">Home Health</h2>}

        {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 focus:outline-none"
      >
      <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
    </svg>

    </button>

      </div>

      {/* Menu Items */}
      <div className="w-full bg-green-100 flex flex-col gap-2 px-2 py-2 rounded-xl">

      {menus.map((menu) => (

          <button
            key={menu.key}
            onClick={() => {
              setActive(menu.key);
              onSelect(menu.key);
            }}
            className={`flex items-center ${
              isOpen ? "gap-3 px-3" : "justify-center"
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
