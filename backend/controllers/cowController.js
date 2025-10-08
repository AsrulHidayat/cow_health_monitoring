import { getAllCows, createCow, getCowByUserId } from "../models/cowModel.js";

// Ambil semua sapi
export const getCows = (req, res) => {
  getAllCows((err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

// Tambah sapi baru (id otomatis dari AUTO_INCREMENT)
export const addCow = async (req, res) => {
  try {
    const { tag, birth_date } = req.body;
    const user_id = req.user.id; // didapat dari verifyToken

    const [result] = await db.query(
      "INSERT INTO cows (user_id, tag, birth_date) VALUES (?, ?, ?)",
      [user_id, tag, birth_date]
    );

    res.status(201).json({ id: result.insertId, tag, birth_date });
  } catch (error) {
    console.error("❌ Gagal menambahkan sapi:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Ambil sapi milik user tertentu
export const getCow = (req, res) => {
  const user_id = req.params.user_id;
  getCowByUserId(user_id, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ message: "Belum ada sapi terdaftar" });
    res.json(results[0]);
  });
};
