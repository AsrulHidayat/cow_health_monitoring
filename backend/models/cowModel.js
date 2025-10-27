import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Cow = db.define(
  "Cow",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // Tambahkan unique constraint jika perlu
    },
    umur: {
      type: DataTypes.STRING(30),
      allowNull: true, // Sesuai dengan database yang membolehkan NULL
    },
    checkupStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "unchecked", // Nilai default saat membuat sapi baru
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at", // Map ke nama kolom di database
    },
  },
  {
    tableName: "cows",
    timestamps: true,
    createdAt: "created_at", // Map createdAt ke kolom created_at
    updatedAt: false, // Tidak ada updatedAt di database
  }
);

export default Cow;
