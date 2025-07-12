const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleMiddleware");

router.get("/dashboard", verifyToken, reportController.getDashboardSummary);

router.get(
  "/export/monthly",
  verifyToken,
  reportController.exportMonthlyReport
);

router.get(
  "/summary",
  verifyToken,
  checkRole(["admin", "kepala_desa"]),
  reportController.getSummary
);

router.get("/harian/stok", verifyToken, reportController.getStokHarian);

router.get(
  "harian/stok/export",
  verifyToken,
  reportController.exportStokHarian
);

router.get("/harian", verifyToken, reportController.getDailyIncomeByCashier);

module.exports = router;

// router.get("/harian", verifyToken, reportController.getDailyReport);
// router.get("/by-date", verifyToken, reportController.getReportByDate);
// router.get("/by-cashier", verifyToken, reportController.getReportByCashier);
// router.get('/stok-harian', verifyToken, checkRole(['admin', 'kepala_desa']), reportController.getStokHarian);
