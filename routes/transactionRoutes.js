const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/", verifyToken, transactionController.createTransaction);
router.get("/me", verifyToken, transactionController.getMyTransactions);

module.exports = router;
