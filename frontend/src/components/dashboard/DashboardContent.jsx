import React, { useState} from 'react';
import { Heart, AlertTriangle, Activity, Plus, TrendingUp, Thermometer, Zap } from 'lucide-react';

// Komponen terpisah untuk Dashboard Content
export function DashboardContent({ cows, onAddCow }) {
  const [showAddModal, setShowAddModal] = useState(false);

  // Hitung statistik berdasarkan data cows yang diterima
  const totalCows = cows?.length || 0;
  const withSensor = cows?.filter(c => c.sensorStatus)?.length || 0;
  const withoutSensor = totalCows - withSensor;
  
  // Hitung kondisi kesehatan dari data suhu sapi
  const getCowHealth = (cow) => {
    // Jika tidak ada data suhu, gunakan property health jika ada
    if (cow.health) return cow.health;
    
    // Hitung berdasarkan suhu jika ada
    if (cow.suhu) {
      const suhu = cow.suhu;
      if (suhu >= 41) return 'critical';
      if (suhu >= 40) return 'warning';
      if (suhu >= 39.6) return 'caution';
      return 'healthy';
    }
    
    return 'unknown';
  };

  const healthyCows = cows?.filter(c => getCowHealth(c) === 'healthy')?.length || 0;
  const cautionCows = cows?.filter(c => getCowHealth(c) === 'caution')?.length || 0;
  const warningCows = cows?.filter(c => getCowHealth(c) === 'warning')?.length || 0;
  const criticalCows = cows?.filter(c => getCowHealth(c) === 'critical')?.length || 0;

  const getHealthColor = (health) => {
    switch(health) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'caution': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'healthy': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getHealthLabel = (health) => {
    switch(health) {
      case 'critical': return 'Segera Tindaki';
      case 'warning': return 'Harus Diperhatikan';
      case 'caution': return 'Perlu Diperhatikan';
      case 'healthy': return 'Sapi Sehat';
      default: return 'Tidak Diketahui';
    }
  };

  const handleAddCow = (e) => {
    e.preventDefault();
    // Trigger parent callback jika ada
    if (onAddCow) {
      setShowAddModal(false);
      // Parent akan handle logic tambah sapi
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Monitoring Ternak</h2>
          <p className="text-gray-600">Pantau kesehatan dan kondisi sapi secara real-time</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Sapi</span>
        </button>
      </div>

        {/* Ringkasan Jumlah Sapi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Sapi */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Jumlah Sapi</p>
                <h3 className="text-4xl font-bold text-blue-600">{totalCows}</h3>
                <p className="text-xs text-gray-500 mt-2">Total sapi terdaftar</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Tercatat (Dengan Sensor) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Tercatat</p>
                <h3 className="text-4xl font-bold text-green-600">{withSensor}</h3>
                <p className="text-xs text-gray-500 mt-2">Sudah dipasangi sensor</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Belum Tercatat (Tanpa Sensor) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Belum Tercatat</p>
                <h3 className="text-4xl font-bold text-orange-600">{withoutSensor}</h3>
                <p className="text-xs text-gray-500 mt-2">Belum dipasangi sensor</p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* History Realtime - Kondisi Sapi */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Kondisi Sapi Saat Ini
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sapi Sehat */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-green-700">{healthyCows}</span>
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-1">Sapi Sehat</h3>
              <p className="text-sm text-green-600">Parameter normal</p>
            </div>

            {/* Perlu Diperhatikan */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-yellow-700">{cautionCows}</span>
              </div>
              <h3 className="text-lg font-bold text-yellow-800 mb-1">Perlu Diperhatikan</h3>
              <p className="text-sm text-yellow-600">Anomali ringan</p>
            </div>

            {/* Harus Diperhatikan */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-orange-700">{warningCows}</span>
              </div>
              <h3 className="text-lg font-bold text-orange-800 mb-1">Harus Diperhatikan</h3>
              <p className="text-sm text-orange-600">Masalah serius</p>
            </div>

            {/* Segera Tindaki */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 hover:shadow-lg transition-all animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-red-700">{criticalCows}</span>
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-1">Segera Tindaki</h3>
              <p className="text-sm text-red-600">Kondisi kritis</p>
            </div>
          </div>
        </div>

        {/* Cow Cards - Daftar Sapi */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-green-600" />
            Daftar Sapi
          </h2>
          
          {cows && cows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cows.map((cow) => {
                const health = getCowHealth(cow);
                return (
                  <div 
                    key={cow.id}
                    className={`rounded-xl p-5 border-2 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer ${getHealthColor(health)}`}
                  >
                    {/* Header Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold">{cow.tag}</h3>
                        <p className="text-sm opacity-75">{cow.umur}</p>
                      </div>
                      <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🐄</span>
                      </div>
                    </div>

                    {/* Status Kesehatan */}
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold mb-1 opacity-75">Status Kesehatan</p>
                      <p className="text-sm font-bold">{getHealthLabel(health)}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white bg-opacity-60 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Thermometer className="w-3 h-3" />
                          <p className="text-xs font-semibold">Suhu</p>
                        </div>
                        <p className="text-sm font-bold">{cow.suhu ? `${cow.suhu}°C` : 'N/A'}</p>
                      </div>
                      
                      <div className="bg-white bg-opacity-60 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="w-3 h-3" />
                          <p className="text-xs font-semibold">Aktivitas</p>
                        </div>
                        <p className="text-sm font-bold">{cow.aktivitas || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Sensor Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-20">
                      <p className="text-xs font-semibold">Sensor</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${cow.sensorStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <p className="text-xs font-bold">{cow.sensorStatus ? 'Aktif' : 'Offline'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Belum ada data sapi</p>
              <p className="text-sm">Klik tombol "Tambah Sapi" untuk menambahkan data sapi baru</p>
            </div>
          )}
        </div>

        {/* Modal Tambah Sapi */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tambah Sapi Baru</h2>
              
              <form onSubmit={handleAddCow} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Sapi</label>
                  <input 
                    type="text" 
                    placeholder="SAPI-009"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Umur (Tahun)</label>
                  <input 
                    type="number" 
                    placeholder="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Umur (Bulan)</label>
                  <input 
                    type="number" 
                    placeholder="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

// Export sebagai default juga untuk standalone usage
export default function LivestockDashboard() {
  const [cows] = useState([
    { id: '001', tag: 'SAPI-001', umur: '2 tahun', health: 'critical', suhu: 41.2, aktivitas: 'Rendah', sensorStatus: true },
    { id: '002', tag: 'SAPI-002', umur: '3 tahun', health: 'warning', suhu: 40.1, aktivitas: 'Normal', sensorStatus: true },
    { id: '003', tag: 'SAPI-003', umur: '1 tahun 6 bulan', health: 'warning', suhu: 40.3, aktivitas: 'Rendah', sensorStatus: true },
    { id: '004', tag: 'SAPI-004', umur: '4 tahun', health: 'warning', suhu: 39.8, aktivitas: 'Normal', sensorStatus: true },
    { id: '005', tag: 'SAPI-005', umur: '2 tahun 3 bulan', health: 'caution', suhu: 39.2, aktivitas: 'Normal', sensorStatus: true },
    { id: '006', tag: 'SAPI-006', umur: '3 tahun 6 bulan', health: 'healthy', suhu: 38.5, aktivitas: 'Aktif', sensorStatus: true },
    { id: '007', tag: 'SAPI-007', umur: '1 tahun', health: 'healthy', suhu: 38.3, aktivitas: 'Aktif', sensorStatus: true },
    { id: '008', tag: 'SAPI-008', umur: '2 tahun 8 bulan', health: 'healthy', suhu: 38.7, aktivitas: 'Normal', sensorStatus: false },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardContent cows={cows} />
      </div>
    </div>
  );
}