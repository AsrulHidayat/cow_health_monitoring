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
      unique: true,
    },
    umur: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    checkupStatus: {
      type: DataTypes.ENUM("Belum diperiksa", "Telah diperiksa"),
      allowNull: false,
      defaultValue: "Belum diperiksa", // sesuai default di database
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "cows",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Cow;
