// Dummy Icons
export const CowIcon = () => (
  <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

export const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);


export { default as Navbar } from "./Navbar";

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
