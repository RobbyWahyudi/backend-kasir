const express = require("express");
const router = express.Router();

// Import fungsi dari controller
const authController = require("../controllers/authController");

// Pastikan yang di-pass ke router.post adalah function
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
