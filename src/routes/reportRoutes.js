const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

/**
 * Raporlama Rotalari (Istege Bagli 03)
 */

// GET /reports/summary veya /api/reports/summary
router.get("/summary", reportController.getSummary);

// GET /reports/completed veya /api/reports/completed
router.get("/completed", reportController.getCompleted);

// GET /reports/pending veya /api/reports/pending
router.get("/pending", reportController.getPending);

module.exports = router;
