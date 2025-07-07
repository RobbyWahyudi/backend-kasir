const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleMiddleware");

router.get("/daily", verifyToken, reportController.getDailyReport);
router.get("/by-date", verifyToken, reportController.getReportByDate);
router.get("/by-cashier", verifyToken, reportController.getReportByCashier);
router.get("/dashboard", verifyToken, reportController.getDashboardSummary);
router.get(
  "/export/monthly",
  verifyToken,
  checkRole(["admin", "kepala_desa"]),
  reportController.exportMonthlyReport
);

module.exports = router;
