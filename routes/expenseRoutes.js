const express = require("express");
const router = express.Router();
const { createExpense } = require("../controllers/expenseController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleMiddleware");

router.post("/", verifyToken, createExpense);

module.exports = router;
