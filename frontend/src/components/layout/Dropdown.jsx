import React, { useState, useEffect, useRef } from "react";

// 🔹 Komponen Ikon Panah (Chevron)
function ChevronDownIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

// 🔹 Ini adalah komponen Dropdown utama
export default function CowDropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cari nama sapi yang dipilih berdasarkan 'value' (ID-nya)
  const selectedOption = options.find((opt) => opt.id === value);

  // Fungsi untuk menutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Fungsi saat salah satu opsi dipilih
  const handleSelect = (optionId) => {
    onChange(optionId); // Kirim ID yang baru
    setIsOpen(false); // Tutup menu
  };

  return (
    <div className="relative w-32" ref={dropdownRef}>
      {/* Tombol yang terlihat (sesuai style di gambar)
      */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {/* Tampilkan nama sapi yang dipilih, atau "Pilih Sapi" jika belum ada */}
        <span className="truncate">
          {selectedOption ? selectedOption.name : "Pilih Sapi"}
        </span>
        <ChevronDownIcon />
      </button>

      {/* Menu dropdown yang muncul */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`px-4 py-2 text-sm cursor-pointer ${
                  option.id === value
                    ? "bg-blue-500 text-white" // Style untuk item yang aktif
                    : "text-gray-900 hover:bg-gray-100" // Style untuk item lain
                }`}
              >
                {option.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}