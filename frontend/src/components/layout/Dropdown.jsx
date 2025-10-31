export default function CowDropdown({ options, value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border px-3 py-2 rounded-md"
    >
      <option value="">Pilih Sapi</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}

