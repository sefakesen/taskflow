const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { validateCreateTask, validateUpdateTask } = require("../middleware/validate");

/**
 * Gorev Yonetim Rotalari
 * 
 * Statik rotalar (/search, /assignee/:name), dinamik rotalardan (/:id)
 * once tanimlanmalidir.
 */

// Istege Bagli 01: Arama ve Kullanici Bazli Listeleme
router.get("/search", taskController.searchTasks);
router.get("/assignee/:name", taskController.getTasksByAssignee);

// Zorunlu CRUD: Listeleme ve Olusturma
router
  .route("/")
  .get(taskController.getAllTasks)
  .post(validateCreateTask, taskController.createTask);

// Zorunlu CRUD: Detay, Guncelleme ve Silme
router
  .route("/:id")
  .get(taskController.getTaskById)
  .put(validateUpdateTask, taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
