const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};


// @desc    Register user baru
// @route   POST /api/auth/register
// @desc Register user baru
exports.registerUser = async (req, res) => {
  console.log("📥 Data masuk ke registerUser:", req.body); 

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log("❌ Ada field kosong!");
    return res.status(400).json({ message: "Harap isi semua field" });
  }

  try {
    const userExists = await User.findByEmail(email);
    console.log("🔍 Hasil cek email:", userExists);

    if (userExists) {
      console.log("⚠️ Email sudah terdaftar");
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password di-hash:", hashedPassword);

    const newUser = await User.create(name, email, hashedPassword);
    console.log("✅ User berhasil dibuat:", newUser);

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

// @desc    Auth user & get token (login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

