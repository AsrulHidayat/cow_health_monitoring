import { DataTypes } from "sequelize";
import db from "../config/db.js";

// Definisi model Movement
const Movement = db.define(
  "Movement",
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
    accel_x: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    accel_y: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    accel_z: {
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
    tableName: "movement_data", // nama tabel di MySQL
    timestamps: false, // kita pakai kolom created_at manual
  }
);

export default Movement;