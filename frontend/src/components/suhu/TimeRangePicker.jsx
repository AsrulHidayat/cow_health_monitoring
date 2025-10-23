// src/components/suhu/TimeRangePicker.jsx

import { useState, useEffect, useRef } from "react";

// Icon SVG untuk jam
const ClockIcon = () => (
  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Pilihan rentang waktu cepat
const QUICK_RANGES = [
  { label: 'Jam Kerja', start: '08:00', end: '17:00' },
  { label: 'Pagi', start: '06:00', end: '10:00' },
  { label: 'Siang', start: '11:00', end: '14:00' },
  { label: 'Sore', start: '15:00', end: '18:00' },
  { label: 'Malam', start: '19:00', end: '23:59' },
  { label: 'Dini Hari', start: '00:00', end: '05:00' },
];

export default function TimeRangePicker({ onApply, onReset, stats }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  
  const pickerRef = useRef(null);

  // Menutup pop-up jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const handleApplyClick = () => {
    onApply(startTime, endTime);
    setIsOpen(false);
  };

  const handleResetClick = () => {
    setStartTime('00:00');
    setEndTime('23:59');
    onReset(); // Panggil onReset untuk me-reset state di parent (Suhu.jsx)
    setIsOpen(false);
  };

  const handleQuickSelect = (start, end) => {
    setStartTime(start);
    setEndTime(end);
  };

  // Helper untuk format waktu dari stats
  const formatTimeFromStats = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid';
    }
  };

  // Ambil data dari prop stats (jika ada)
  const firstDataTime = formatTimeFromStats(stats?.min_created_at);
  const lastDataTime = formatTimeFromStats(stats?.max_created_at);

  const isDefault = startTime === '00:00' && endTime === '23:59';
  const buttonLabel = isDefault ? "Semua Waktu" : `${startTime} - ${endTime}`;

  return (
    <div className="relative" ref={pickerRef}>
      {/* Tombol Utama */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm transition hover:border-blue-400 hover:shadow ${
          !isDefault ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
        }`}
      >
        <ClockIcon />
        <span>{buttonLabel}</span>
      </button>

      {/* Pop-up Dropdown */}
      {isOpen && (
        <div className="absolute z-20 right-0 mt-2 w-[450px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-fadeIn">
          
          <div className="flex">
            {/* Kolom Kiri: Pilihan Cepat & Info Data */}
            <div className="w-1/3 border-r border-gray-100 pr-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Pilihan Cepat</h5>
              <div className="flex flex-col items-start gap-1">
                {QUICK_RANGES.map(range => (
                  <button 
                    key={range.label} 
                    onClick={() => handleQuickSelect(range.start, range.end)}
                    className="text-sm text-blue-600 hover:underline text-left"
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {stats && (
                <>
                  <hr className="my-3" />
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Info Data</h5>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Data Pertama: <span className="font-medium text-gray-700">{firstDataTime}</span></p>
                    <p>Data Terakhir: <span className="font-medium text-gray-700">{lastDataTime}</span></p>
                  </div>
                </>
              )}
            </div>

            {/* Kolom Kanan: Input Manual */}
            <div className="w-2/3 pl-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-4">Atur Waktu Manual</h5>
              <div className="space-y-4">
                {/* Input Start Time */}
                <div className="flex items-center justify-between">
                  <label htmlFor="startTime" className="text-sm text-gray-600">Dari Jam:</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border border-gray-300 rounded-lg text-gray-600 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                {/* Input End Time */}
                <div className="flex items-center justify-between">
                  <label htmlFor="endTime" className="text-sm text-gray-600">Sampai Jam:</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border border-gray-300 rounded-lg text-gray-600 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Tombol */}
          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={handleResetClick}
              className="px-3 py-1 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              onClick={handleApplyClick}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 shadow-sm"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* Style animasi (sudah ada) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}