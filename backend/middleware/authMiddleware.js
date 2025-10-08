import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan. Silakan login kembali." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // menyimpan data user di req
    next();
  } catch (error) {
    console.error("❌ Token invalid:", error);
    res.status(401).json({ message: "Token tidak valid atau telah kedaluwarsa." });
  }
};
