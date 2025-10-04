const db = require("../config/db");

const User = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  },

  create: (name, email, password) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (err, results) => {
          if (err) reject(err);
          resolve({ id: results.insertId, name, email });
        }
      );
    });
  },
};

module.exports = User;
