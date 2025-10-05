const { pool } = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0]; // kalau ada
  },

  create: async (name, email, password) => {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    return { id: result.insertId, name, email };
  },
};

module.exports = User;
