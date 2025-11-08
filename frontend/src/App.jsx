import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Sapi from "./pages/Sapi";
import Suhu from "./pages/Suhu";
import DetakJantung from "./pages/DetakJantung";
import Gerakan from "./pages/Gerakan";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  // 🔹 Fungsi untuk navigasi halaman
  const handlePageChange = (page) => {
    console.log(`🔄 Navigasi ke halaman: ${page}`);
    setActivePage(page);
  };

  // 🔹 Fungsi untuk logout
  const handleExit = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🔹 Render halaman berdasarkan activePage
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "sapi":
        return <Sapi onNavigate={handlePageChange} />;
      case "suhu":
        return <Suhu />;
      case "detak":
        return <DetakJantung />;
      case "gerakan":
        return <Gerakan />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar onSelect={handlePageChange} onExit={handleExit} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}