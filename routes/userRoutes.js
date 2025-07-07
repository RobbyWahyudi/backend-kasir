const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleMiddleware");

// Contoh endpoint yang dilindungi oleh token
router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "Data user terverifikasi",
    user: req.user, // Diambil dari token yang sudah dicek
  });
});
// Semua endpoint diamankan dengan token
router.get("/", verifyToken, checkRole(["admin"]), userController.getAllUsers);
router.get(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  userController.getUserById
);
router.post("/", verifyToken, checkRole(["admin"]), userController.createUser);
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  userController.updateUser
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
