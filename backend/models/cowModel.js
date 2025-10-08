import db from "../config/db.js";

export const getAllCows = (callback) => {
  const sql = "SELECT * FROM cows";
  db.query(sql, callback);
};

export const createCow = (user_id, tag, birth_date, callback) => {
  const sql = "INSERT INTO cows (user_id, tag, birth_date) VALUES (?, ?, ?)";
  db.query(sql, [user_id, tag, birth_date], callback);
};

export const getCowByUserId = (user_id, callback) => {
  const sql = "SELECT * FROM cows WHERE user_id = ?";
  db.query(sql, [user_id], callback);
};
