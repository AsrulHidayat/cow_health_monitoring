import { create } from 'zustand';
import { getAllCows } from '../services/cowService'; 

const useCowStore = create((set) => ({
 cows: [],
 loading: true,
 fetchCows: async () => {
  try {
   set({ loading: true });
   // Panggil fungsi dari service Anda
   const allCows = await getAllCows(); 

      // --- 🔽 PERBAIKAN DITAMBAHKAN DI SINI 🔽 ---
      // Urutkan data sapi berdasarkan nomor tag secara numerik
   const sortedCows = allCows.sort((a, b) => {
        // Ekstrak nomor dari tag (misal: "SAPI-001" -> 1)
    const numA = parseInt(a.tag.match(/SAPI-(\d+)/)?.[1] || 0);
    const numB = parseInt(b.tag.match(/SAPI-(\d+)/)?.[1] || 0);
    return numA - numB;
   });
      // --- 🔼 BATAS PERBAIKAN 🔼 ---

   // Simpan data yang sudah di-sorting ke state
   set({ cows: sortedCows, loading: false });
  } catch (err) {
   console.error("Gagal mengambil data sapi:", err);
   set({ cows: [], loading: false });
  }
 },
}));

export { useCowStore };