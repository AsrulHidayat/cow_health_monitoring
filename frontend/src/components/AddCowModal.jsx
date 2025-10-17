import React, { useState, useEffect } from "react";

export default function AddCowModal({ onClose, onAdd, cowCount }) {
  const [umurTahun, setUmurTahun] = useState("");
  const [umurBulan, setUmurBulan] = useState("");
  const [umurSapi, setUmurSapi] = useState("");
  const [idSapi, setIdSapi] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // ID sapi otomatis berdasarkan jumlah sapi yang sudah ada
    const newId = `SAPI-${String(cowCount + 1).padStart(3, "0")}`;
    setIdSapi(newId);
  }, [cowCount]);

  // Gabungkan input tahun dan bulan menjadi satu string umur
  useEffect(() => {
    if (umurTahun || umurBulan) {
      const tahun = umurTahun ? `${umurTahun} tahun` : "";
      const bulan = umurBulan ? `${umurBulan} bulan` : "";
      setUmurSapi(`${tahun} ${bulan}`.trim());
    } else {
      setUmurSapi("");
    }
  }, [umurTahun, umurBulan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validasi: tahun dan bulan tidak boleh 0 bersamaan
    const tahun = parseInt(umurTahun) || 0;
    const bulan = parseInt(umurBulan) || 0;

    if (tahun === 0 && bulan === 0) {
      setError("Umur sapi harus diisi! Minimal isi tahun atau bulan.");
      return;
    }

    // Validasi: minimal salah satu harus diisi
    if (!umurSapi || umurSapi.trim() === "") {
      setError("Umur sapi tidak boleh kosong!");
      return;
    }

    // Kirim data ke parent component
    onAdd({
      tag: idSapi,
      umur: umurSapi,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <h2 className="text-lg font-semibold text-center mb-4 border-b pb-2">
          Tambah Sapi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID sapi otomatis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Sapi
            </label>
            <input
              type="text"
              value={idSapi}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Input umur tahun */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umur (Tahun)
            </label>
            <input
              type="number"
              min="0"
              value={umurTahun}
              onChange={(e) => setUmurTahun(e.target.value)}
              placeholder="Contoh: 2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Input umur bulan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umur (Bulan)
            </label>
            <input
              type="number"
              min="0"
              max="11"
              value={umurBulan}
              onChange={(e) => setUmurBulan(e.target.value)}
              placeholder="Contoh: 3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Umur gabungan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umur Sapi
            </label>
            <input
              type="text"
              value={umurSapi}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Tambah
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}