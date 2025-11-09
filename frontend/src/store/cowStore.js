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
      set({ cows: allCows, loading: false });
    } catch (err) {
      console.error("Gagal mengambil data sapi:", err);
      set({ cows: [], loading: false });
    }
  },
}));

export { useCowStore };