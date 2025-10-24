import React, { useState } from "react";

export default function DateTimeRangePicker({ onApply, onReset, stats, timeCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [warning, setWarning] = useState(null); // ⚠️ Tambahan: state untuk pesan peringatan

  const isDateSelected = startDate && endDate;

  const handleApply = () => {
    if (!isDateSelected) {
      setWarning("Harap pilih tanggal mulai dan tanggal akhir");
      return;
    }

    const diffDays =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    // 🔒 Validasi berdasarkan kategori waktu
    if (timeCategory === "five_seconds" && diffDays > 1) {
      setWarning("Kategori 'Per 5 Detik' hanya bisa memilih data dalam satu hari.");
      return;
    }

    if (timeCategory === "minute" && diffDays > 1) {
      setWarning("Kategori 'Per Menit' hanya bisa memilih data maksimal tiga hari.");
      return;
    }

    setWarning(null); // ✅ Hapus peringatan jika valid
    onApply({ startDate, endDate, startTime, endTime });
    setIsOpen(false);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("00:00");
    setEndTime("23:59");
    setWarning(null);
    onReset();
    setIsOpen(false);
  };

  const setQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setWarning(null);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDateSelected
          ? "bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
          : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:shadow"
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-medium">
          {isDateSelected
            ? `${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`
            : "Filter Tanggal & Jam"}
        </span>
        {isDateSelected && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Filter Berdasarkan Tanggal & Jam
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pilih tanggal wajib, waktu opsional
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* ⚠️ Peringatan ditampilkan di atas Info Data */}
              {warning && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn">
                  <p className="leading-snug">{warning}</p>
                </div>
              )}


              {/* Quick Presets */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Pilihan Cepat
                </label>

                {/* Preset untuk tanggal */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => setQuickDate(0)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => setQuickDate(3)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    3 Hari
                  </button>
                  <button
                    onClick={() => setQuickDate(7)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => setQuickDate(30)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    30 Hari
                  </button>
                  <button
                    onClick={() => setQuickDate(90)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    90 Hari
                  </button>
                </div>

                {/* Preset untuk waktu (aktif jika tanggal sudah dipilih) */}
                <div
                  className={`grid grid-cols-3 gap-2 ${!isDateSelected ? "opacity-50 pointer-events-none" : ""
                    }`}
                >
                  {[
                    { label: "Pagi", start: "06:00", end: "10:59" },
                    { label: "Siang", start: "11:00", end: "14:59" },
                    { label: "Sore", start: "15:00", end: "18:59" },
                    { label: "Malam", start: "19:00", end: "23:59" },
                    { label: "Dini Hari", start: "00:00", end: "05:59" },
                    { label: "24 jam", start: "00:00", end: "23:59" },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setStartTime(range.start);
                        setEndTime(range.end);
                      }}
                      className="px-3 py-2 text-sm bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={(() => {
                      const today = new Date().toISOString().split("T")[0];
                      if (timeCategory === "five_seconds") return today; // hanya hari ini
                      if (timeCategory === "minute") {
                        const limit = new Date();
                        limit.setDate(limit.getDate() - 3);
                        return today; // tetap hari ini, tetapi validasi dilakukan di handleApply
                      }
                      return today;
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                  />

                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={(() => {
                      const today = new Date().toISOString().split("T")[0];
                      return today;
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                  />

                </div>
              </div>

              {/* Time Range - aktif hanya jika tanggal terpilih */}
              <div className={`${!isDateSelected ? "opacity-50 pointer-events-none" : ""}`}>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Rentang Waktu (Opsional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stats Info */}
              {stats && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-blue-800">Info Data</span>
                  </div>

                  <div className="text-xs text-blue-700 space-y-1 pl-1">
                    <p>
                      Total Record:{" "}
                      <span className="font-bold">{stats.count || 0}</span>
                    </p>
                    {stats.firstRecord && (
                      <p>
                        Data Pertama:{" "}
                        <span className="font-medium">
                          {new Date(stats.firstRecord).toLocaleDateString("id-ID")}
                        </span>
                      </p>
                    )}
                    {stats.lastRecord && (
                      <p>
                        Data Terakhir:{" "}
                        <span className="font-medium">
                          {new Date(stats.lastRecord).toLocaleDateString("id-ID")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  disabled={!isDateSelected}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
