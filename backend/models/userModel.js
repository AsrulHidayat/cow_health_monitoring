// models/userModel.js
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define(
"User",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },{
    tableName: "users", // nama tabel di database
    timestamps: false,  // ubah ke true jika kamu pakai createdAt, updatedAt
  });

export default User;
