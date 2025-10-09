import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log(`Membaca DB_PORT dari .env: ${process.env.DB_PORT}`);

const db = new Sequelize(
  process.env.DB_NAME || "monitoring_sapi",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
  }
);

// Cek koneksi database
export const checkConnection = async () => {
  try {
    await db.authenticate();
    console.log("✅ Database connection successful.");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
};

export default db;
