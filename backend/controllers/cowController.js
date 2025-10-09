// Digunakan untuk operasi CRUD pada model Cow

import Cow from "../models/cowModel.js";

// Ambil semua sapi
export const getCows = async (req, res) => {
  try {
    const cows = await Cow.findAll();
    res.json(cows);
  } catch (error) {
    console.error("❌ Gagal mengambil data sapi:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Tambah sapi baru
export const addCow = async (req, res) => {
  try {
    const { tag, birth_date } = req.body;
    const user_id = req.user.id; // dari middleware verifyToken
    const newCow = await Cow.create({ user_id, tag, birth_date });
    res.status(201).json(newCow);
  } catch (error) {
    console.error("❌ Gagal menambahkan sapi:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Ambil sapi milik user tertentu
export const getCow = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const cows = await Cow.findAll({ where: { user_id } });

    if (cows.length === 0)
      return res.status(404).json({ message: "Belum ada sapi terdaftar" });

    res.json(cows);
  } catch (error) {
    console.error("❌ Gagal mengambil sapi:", error);
    res.status(500).json({ message: "Database error" });
  }
};
