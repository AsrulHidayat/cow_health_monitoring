import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from "./components/Sidebar";
import Dashboard from './pages/Dashboard';
import Suhu from "./pages/Suhu";

/**
 * Komponen untuk melindungi route.
 * Jika tidak ada user di localStorage, akan diarahkan ke halaman login.
 */
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Komponen Layout Utama yang memiliki Sidebar.
 * <Outlet /> akan merender komponen halaman sesuai dengan URL.
 */
const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-5">
        <Outlet /> 
      </main>
    </div>
  );
};


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Arahkan path utama "/" ke dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suhu" element={<Suhu />} />
          <Route path="/sapi" element={<h1>Data Sapi</h1>} />
          <Route path="/detak-jantung" element={<h1>Monitoring Detak Jantung</h1>} />
          <Route path="/gerakan" element={<h1>Monitoring Gerakan</h1>} />
        </Route>

        {/* Fallback untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<h1>404: Halaman Tidak Ditemukan</h1>} />
      </Routes>
    </Router>
  );
}