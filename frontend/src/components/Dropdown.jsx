
// Untuk sementara tidak menggunakan komponen ini karena masih ada bug di flowbite-react

// export default function CowDropdown({ options, value, onChange }) {
//   // Cari label dari value yang sedang aktif
//   const selectedOption = options.find((opt) => opt.id === value);

//   return (
//     <Dropdown label={selectedOption ? selectedOption.name : "Pilih Sapi"}>
//       {options.map((opt) => (
//         <Dropdown.Item key={opt.id} onClick={() => onChange(opt.id)}>
//           {opt.name}
//         </Dropdown.Item>
//       ))}
//     </Dropdown>
//   );
// }

// Hapus Ini jika bug flowbite-react sudah diperbaiki
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

