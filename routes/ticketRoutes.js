const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Proteksi semua route dengan token
router.get("/", verifyToken, ticketController.getAllTickets);
router.post("/", verifyToken, ticketController.createTicket);
router.put("/:id", verifyToken, ticketController.updateTicket);
router.delete("/:id", verifyToken, ticketController.deleteTicket);

module.exports = router;
