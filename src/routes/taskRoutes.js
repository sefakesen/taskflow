const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { validateCreateTask, validateUpdateTask } = require("../middleware/validate");

/**
 * ─── Görev Rotaları ───────────────────────────────────────────
 *
 * NOT: Statik rotalar (/search, /assignee/:name) dinamik
 * rotalardan (:id) ÖNCE tanımlanmalıdır — aksi hâlde Express
 * "search" veya "assignee"yi bir ID parametresi olarak algılar.
 */

// ── İsteğe Bağlı 01 — Arama ve Kullanıcı Bazlı Listeleme ──────
// GET /tasks/search?keyword=backend (veya /api/tasks/search)
router.get("/search", taskController.searchTasks);

// GET /tasks/assignee/:name (veya /api/tasks/assignee/:name)
router.get("/assignee/:name", taskController.getTasksByAssignee);

// ── Zorunlu — CRUD ─────────────────────────────────────────────
// GET    /tasks              — tüm görevler (+ query filtreleri/sayfalama/sıralama)
// POST   /tasks              — yeni görev oluştur
router
  .route("/")
  .get(taskController.getAllTasks)
  .post(validateCreateTask, taskController.createTask);

// GET    /tasks/:id          — görev detayı
// PUT    /tasks/:id          — görev güncelleme (tam/kısmi)
// PATCH  /tasks/:id          — görev kısmi güncelleme
// DELETE /tasks/:id          — görev silme
router
  .route("/:id")
  .get(taskController.getTaskById)
  .put(validateUpdateTask, taskController.updateTask)
  .patch(validateUpdateTask, taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
