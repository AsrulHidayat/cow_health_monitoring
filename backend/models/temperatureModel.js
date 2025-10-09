import { DataTypes } from "sequelize";
import db from "../config/db.js";

// Definisi model Temperature
const Temperature = db.define(
  "Temperature",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cows", // nama tabel relasi
        key: "id",
      },
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "temperature_data", // nama tabel di MySQL
    timestamps: false, // kita pakai kolom created_at manual
  }
);

export default Temperature;
