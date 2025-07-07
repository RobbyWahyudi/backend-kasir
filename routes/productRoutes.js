const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Semua endpoint dilindungi dengan token
router.get("/", verifyToken, productController.getAllProducts);
router.post("/", verifyToken, productController.createProduct);
router.put("/:id", verifyToken, productController.updateProduct);
router.delete("/:id", verifyToken, productController.deleteProduct);

module.exports = router;
