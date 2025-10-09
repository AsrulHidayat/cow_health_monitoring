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
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  umur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "cows",
  timestamps: true,
});

export default Cow;
