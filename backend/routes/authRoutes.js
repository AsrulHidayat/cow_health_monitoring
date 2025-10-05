const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// Rute untuk register & login
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
