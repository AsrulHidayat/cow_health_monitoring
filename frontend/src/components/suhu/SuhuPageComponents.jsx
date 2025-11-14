// Dummy Icons
export const CowIcon = () => (
  <div className="flex items-center justify-center">
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="#F3F4F6" />

      {/* X icon */}
      <path
        d="M30 30 L50 50 M50 30 L30 50"
        stroke="#9CA3AF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);


export { default as Navbar } from "../layout/Navbar";

export const Dropdown = ({ options, value, onChange }) => (
  <select
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white"
  >
    <option value="">Pilih Sapi</option>
    {options.map((opt) => (
      <option key={opt.id} value={opt.id}>
        {opt.name}
      </option>
    ))}
  </select>
);
