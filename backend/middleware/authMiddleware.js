import jwt from "jsonwebtoken";

/**
 * Middleware untuk memverifikasi JWT Token.
 * - Memeriksa header Authorization: "Bearer <token>"
 * - Jika valid, menambahkan data user ke req.user
 * - Jika tidak valid, melempar response 401
 */

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Pastikan header Authorization ada dan formatnya benar
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Silakan login kembali.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi token menggunakan secret dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user yang ter-decode ke req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user", // opsional jika kamu ingin gunakan role
    };

    // Lanjut ke middleware berikutnya
    next();
  } catch (error) {
    console.error("❌ Token invalid:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token telah kedaluwarsa. Silakan login kembali."
          : "Token tidak valid. Akses ditolak.",
    });
  }
};
