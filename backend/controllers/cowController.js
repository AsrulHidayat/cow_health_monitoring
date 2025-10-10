import Cow from "../models/cowModel.js";

// Ambil semua sapi milik user yang login
export const getCows = async (req, res) => {
  try {
    const user_id = req.user.id; // dari middleware verifyToken
    const cows = await Cow.findAll({ 
      where: { user_id },
      order: [['created_at', 'DESC']]
    });
    res.json(cows);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Tambah sapi baru
export const addCow = async (req, res) => {
  try {
    console.log("📥 Data yang diterima:", req.body);
    console.log("👤 User dari token:", req.user);
    
    const { tag, umur } = req.body; 
    const user_id = req.user.id; // dari middleware verifyToken
    
    // Validasi input
    if (!tag || !umur) {
      return res.status(400).json({ 
        message: "Tag dan umur sapi harus diisi",
        received: { tag, umur }
      });
    }
    
    // Buat sapi baru dengan field yang sesuai
    const newCow = await Cow.create({ 
      user_id, 
      tag, 
      umur // Gunakan 'umur' sesuai dengan model
    });
    
    console.log("✅ Sapi berhasil ditambahkan ke DB:", newCow.toJSON());
    res.status(201).json(newCow);
    
  } catch (error) {
    console.error("❌ Gagal menambahkan sapi:", error);
    res.status(500).json({ 
      message: "Gagal menambahkan sapi ke database", 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : undefined
    });
  }
};

// Ambil sapi berdasarkan ID sapi
export const getCowById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const cow = await Cow.findOne({ 
      where: { 
        id, 
        user_id // Pastikan user hanya bisa akses sapinya sendiri
      } 
    });

    if (!cow) {
      return res.status(404).json({ message: "Sapi tidak ditemukan" });
    }

    res.json(cow);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Hapus sapi
export const deleteCow = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const deleted = await Cow.destroy({
      where: { 
        id, 
        user_id // Pastikan user hanya bisa hapus sapinya sendiri
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: "Sapi tidak ditemukan" });
    }
    
    res.json({ message: "Sapi berhasil dihapus", id });
  } catch (error) {
    console.error("❌ Gagal menghapus sapi:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};