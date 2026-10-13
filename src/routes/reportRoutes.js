const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

/**
 * ─── Raporlama Rotaları (İsteğe Bağlı 03) ────────────────────
 */

// GET /api/reports/summary    — genel sistem özeti
router.get("/summary", reportController.getSummary);

// GET /api/reports/completed  — tamamlanan görevler
router.get("/completed", reportController.getCompleted);

// GET /api/reports/pending    — bekleyen görevler
router.get("/pending", reportController.getPending);

// GET /api/reports/critical   — kritik öncelikli açık görevler
router.get("/critical", reportController.getCritical);

module.exports = router;
