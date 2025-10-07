import React, { useState, useEffect } from "react";

export default function AddCowModal({ onClose, onAdd, cowCount }) {
  const [umurSapi, setUmurSapi] = useState("");
  const [idSapi, setIdSapi] = useState("");

  useEffect(() => {
    // ID sapi otomatis berdasarkan jumlah sapi yang sudah ada
    const newId = `SAPI-${String(cowCount + 1).padStart(3, "0")}`;
    setIdSapi(newId);
  }, [cowCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!umurSapi) return;
    onAdd({ id: idSapi, umur: umurSapi });
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

          {/* Umur sapi input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umur Sapi
            </label>
            <input
              type="number"
              value={umurSapi}
              onChange={(e) => setUmurSapi(e.target.value)}
              placeholder="Dalam tahun"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

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
