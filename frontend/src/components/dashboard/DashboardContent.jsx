import React, { useState } from 'react';
import { Heart, AlertTriangle, Activity, Plus, TrendingUp, Thermometer, Zap } from 'lucide-react';

// Komponen Dashboard Content yang sudah diperkecil
export function DashboardContent({ cows, onAddCow }) {
    const [showAddModal, setShowAddModal] = useState(false);

    // Hitung statistik berdasarkan data cows yang diterima
    const totalCows = cows?.length || 0;
    const withSensor = cows?.filter(c => c.sensorStatus)?.length || 0;
    const checked = cows?.filter(c => c.checkupStatus === 'Sudah diperiksa')?.length || 0;
    const unchecked = cows?.filter(c => c.checkupStatus !== 'Sudah diperiksa')?.length || 0;

    // Hitung kondisi kesehatan dari data suhu sapi
    const getCowHealth = (cow) => {
        if (cow.health) return cow.health;

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
        switch (health) {
            case 'critical': return 'bg-red-100 border-red-300 text-red-800';
            case 'warning': return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'caution': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'healthy': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const getHealthLabel = (health) => {
        switch (health) {
            case 'critical': return 'Segera Tindaki';
            case 'warning': return 'Harus Diperhatikan';
            case 'caution': return 'Perlu Diperhatikan';
            case 'healthy': return 'Sapi Sehat';
            default: return 'Tidak Diketahui';
        }
    };

    const handleAddCow = (e) => {
        e.preventDefault();
        if (onAddCow) {
            setShowAddModal(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Add Button - Compact */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard Monitoring Ternak</h2>
                    <p className="text-sm text-gray-600">Pantau kesehatan dan kondisi sapi secara real-time</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Sapi</span>
                </button>
            </div>

            {/* Ringkasan Jumlah Sapi - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total Sapi */}
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Jumlah Sapi</p>
                            <h3 className="text-2xl font-bold text-blue-600">{totalCows}</h3>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Tercatat (Dengan Sensor) */}
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Tercatat</p>
                            <h3 className="text-2xl font-bold text-green-600">{withSensor}</h3>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Sudah Diperiksa */}
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Sudah Diperiksa</p>
                            <h3 className="text-2xl font-bold text-purple-600">{checked}</h3>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Belum Diperiksa */}
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Belum Diperiksa</p>
                            <h3 className="text-2xl font-bold text-orange-600">{unchecked}</h3>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* History Realtime - Kondisi Sapi - Compact */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Kondisi Sapi Saat Ini
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Real-time</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Sapi Sehat */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-green-700">{healthyCows}</span>
                        </div>
                        <h3 className="text-sm font-bold text-green-800 mb-1">Sapi Sehat</h3>
                        <p className="text-xs text-green-600">Parameter normal</p>
                    </div>

                    {/* Perlu Diperhatikan */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-yellow-700">{cautionCows}</span>
                        </div>
                        <h3 className="text-sm font-bold text-yellow-800 mb-1">Perlu Diperhatikan</h3>
                        <p className="text-xs text-yellow-600">Anomali ringan</p>
                    </div>

                    {/* Harus Diperhatikan */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-orange-700">{warningCows}</span>
                        </div>
                        <h3 className="text-sm font-bold text-orange-800 mb-1">Harus Diperhatikan</h3>
                        <p className="text-xs text-orange-600">Masalah serius</p>
                    </div>

                    {/* Segera Tindaki */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200 hover:shadow-md transition-all animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-red-700">{criticalCows}</span>
                        </div>
                        <h3 className="text-sm font-bold text-red-800 mb-1">Segera Tindaki</h3>
                        <p className="text-xs text-red-600">Kondisi kritis</p>
                    </div>
                </div>
            </div>

            {/* Cow Cards - Daftar Sapi - Compact */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Daftar Sapi
                </h2>

                {cows && cows.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                        {cows
                            .slice() 
                            .sort((a, b) => a.id - b.id) // urutkan dari ID terkecil ke terbesar
                            .map((cow) => {
                                const health = getCowHealth(cow);
                                const checkupStatus = cow.checkupStatus || 'Belum diperiksa';
                                const isChecked = checkupStatus === 'Sudah diperiksa';

                                return (
                                    <div
                                        key={cow.id}
                                        className={`rounded-lg p-3 border-2 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer ${getHealthColor(health)}`}
                                    >
                                        {/* Header Card */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-bold">{cow.tag}</h3>
                                                <p className="text-xs opacity-75">{cow.umur}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-white bg-opacity-50 rounded-full flex items-center justify-center">
                                                <span className="text-xl">🐄</span>
                                            </div>
                                        </div>

                                        {/* Status Kesehatan */}
                                        <div className="bg-white bg-opacity-60 rounded-md p-2 mb-2">
                                            <p className="text-xs font-semibold mb-1 opacity-75">Status Kesehatan</p>
                                            <p className="text-xs font-bold">{getHealthLabel(health)}</p>
                                        </div>

                                        {/* Status Pemeriksaan */}
                                        <div className={`rounded-md p-2 mb-2 border ${isChecked
                                                ? 'bg-purple-50 border-purple-200'
                                                : 'bg-orange-50 border-orange-200'
                                            }`}>
                                            <div className="flex items-center gap-1 mb-1">
                                                {isChecked ? (
                                                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                                <p className={`text-xs font-semibold ${isChecked ? 'text-purple-700' : 'text-orange-700'
                                                    }`}>Pemeriksaan</p>
                                            </div>
                                            <p className={`text-xs font-bold ${isChecked ? 'text-purple-800' : 'text-orange-800'
                                                }`}>{checkupStatus}</p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="bg-white bg-opacity-60 rounded-md p-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Thermometer className="w-3 h-3" />
                                                    <p className="text-xs font-semibold">Suhu</p>
                                                </div>
                                                <p className="text-xs font-bold">{cow.suhu ? `${cow.suhu}°C` : 'N/A'}</p>
                                            </div>

                                            <div className="bg-white bg-opacity-60 rounded-md p-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Activity className="w-3 h-3" />
                                                    <p className="text-xs font-semibold">Aktivitas</p>
                                                </div>
                                                <p className="text-xs font-bold">{cow.aktivitas || 'N/A'}</p>
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
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-base mb-2">Belum ada data sapi</p>
                        <p className="text-sm">Klik tombol "Tambah Sapi" untuk menambahkan data sapi baru</p>
                    </div>
                )}
            </div>

            {/* Modal Tambah Sapi */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Sapi Baru</h2>

                        <form onSubmit={handleAddCow} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ID Sapi</label>
                                <input
                                    type="text"
                                    placeholder="SAPI-009"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Umur (Tahun)</label>
                                <input
                                    type="number"
                                    placeholder="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Umur (Bulan)</label>
                                <input
                                    type="number"
                                    placeholder="6"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition text-sm"
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

export default DashboardContent;