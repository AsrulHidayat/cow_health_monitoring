import { DataTypes } from "sequelize";
import db from "../config/db.js";

// Definisi model Activity
const Activity = db.define(
  "Activity",
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
      allowNull: true,
    },
    accel_y: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    accel_z: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    activity: {
      type: DataTypes.ENUM('Berbaring', 'Berdiri'),
      allowNull: true,
      defaultValue: 'Berdiri',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    is_deleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "activity_data", // nama tabel di MySQL
    timestamps: false, // kita pakai kolom created_at manual
  }
);

export default Activity;