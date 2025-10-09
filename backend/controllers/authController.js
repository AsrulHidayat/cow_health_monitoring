import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Model Sequelize

// 🔐 Fungsi untuk generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// 🧩 REGISTER USER BARU
export const registerUser = async (req, res) => {
  console.log("📥 Data masuk ke registerUser:", req.body);

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log("❌ Ada field kosong!");
    return res.status(400).json({ message: "Harap isi semua field" });
  }

  try {
    // 🔍 Cek apakah user sudah terdaftar
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log("⚠️ Email sudah terdaftar");
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // 🔐 Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Buat user baru
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("✅ User berhasil dibuat:", newUser.dataValues);

    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser.id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔑 LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Cek user berdasarkan email
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Email atau password salah" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
