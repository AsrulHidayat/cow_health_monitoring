import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Cow = db.define("Cow", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tag: {
    type: DataTypes.STRING(50), // Sesuaikan dengan varchar(50) di database
    allowNull: false,
    unique: true // Tambahkan unique constraint jika perlu
  },
  umur: {
    type: DataTypes.STRING(30), // Sesuaikan dengan varchar(30) di database
    allowNull: true, // Sesuai dengan database yang membolehkan NULL
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // Map ke nama kolom di database
  }
}, {
  tableName: "cows",
  timestamps: true,
  createdAt: 'created_at', // Map createdAt ke kolom created_at
  updatedAt: false // Tidak ada updatedAt di database
});

export default Cow;