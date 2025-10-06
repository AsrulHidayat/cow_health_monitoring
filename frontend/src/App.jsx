import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Sapi from "./pages/Sapi";
import Suhu from "./pages/Suhu";
import DetakJantung from "./pages/DetakJantung";
import Gerakan from "./pages/Gerakan";

// Components
import Sidebar from "./components/Sidebar";

/**
 * ProtectedRoute: Hanya render children jika user login
 */
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * MainLayout: Layout utama dengan sidebar
 */
const MainLayout = () => {
  const navigate = useNavigate();

  const handleSelect = (menuKey) => {
    switch (menuKey) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "sapi":
        navigate("/sapi");
        break;
      case "suhu":
        navigate("/suhu");
        break;
      case "detak":
        navigate("/detak-jantung");
        break;
      case "gerakan":
        navigate("/gerakan");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const handleExit = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar tetap di kiri */}
      <Sidebar onSelect={handleSelect} onExit={handleExit} />

      {/* Area konten */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
        <div className="min-h-full w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


/**
 * App Component
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suhu" element={<Suhu />} />
          <Route path="/sapi" element={<Sapi />} />
          <Route path="/detak-jantung" element={<DetakJantung />} />
          <Route path="/gerakan" element={<Gerakan />} />
        </Route>

        {/* Fallback halaman tidak ditemukan */}
        <Route path="*" element={<h1>404: Halaman Tidak Ditemukan</h1>} />
      </Routes>
    </Router>
  );
}
