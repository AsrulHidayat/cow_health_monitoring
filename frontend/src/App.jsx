import React from "react";
import {
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
import Sidebar from "./components/layout/Sidebar";

/**
 * ProtectedRoute: Hanya render children jika user login
 */
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * MainLayout: Layout utama dengan sidebar
 */
const MainLayout = () => {
  const navigate = useNavigate();

  const handleSelect = (menuKey) => {
    const routes = {
      dashboard: "/dashboard",
      sapi: "/sapi",
      suhu: "/suhu",
      detak: "/detak-jantung",
      gerakan: "/gerakan",
    };
    navigate(routes[menuKey] || "/dashboard");
  };

  const handleExit = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar onSelect={handleSelect} onExit={handleExit} />

      {/* Konten utama */}
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suhu" element={<Suhu />} />
        <Route path="/sapi" element={<Sapi />} />
        <Route path="/detak-jantung" element={<DetakJantung />} />
        <Route path="/gerakan" element={<Gerakan />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          <h1 className="text-center mt-20 text-2xl font-semibold">
            404 | Halaman Tidak Ditemukan
          </h1>
        }
      />
    </Routes>
  );
}
