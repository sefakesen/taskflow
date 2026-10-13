const taskStore = require("../data/taskStore");

/**
 * GET /api/tasks
 * Tüm görevleri listeler.
 * Query params: status, priority, assignee, keyword, page, limit, sort, order
 */
const getAllTasks = (req, res) => {
  const hasFilters =
    req.query.status ||
    req.query.priority ||
    req.query.assignee ||
    req.query.keyword ||
    req.query.page ||
    req.query.limit ||
    req.query.sort;

  if (hasFilters) {
    const result = taskStore.filterTasks(req.query);
    return res.status(200).json({
      success: true,
      ...result,
    });
  }

  const tasks = taskStore.getAllTasks();
  res.status(200).json({
    success: true,
    total: tasks.length,
    tasks,
  });
};

/**
 * GET /api/tasks/:id
 * Belirli bir görevi ID ile getirir.
 */
const getTaskById = (req, res) => {
  const task = taskStore.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Görev bulunamadı: ID ${req.params.id}`,
    });
  }
  res.status(200).json({ success: true, task });
};

/**
 * GET /api/tasks/search?keyword=...
 * Başlık veya açıklamada anahtar kelimeyle arar.
 */
const searchTasks = (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "'keyword' query parametresi zorunludur.",
    });
  }
  const result = taskStore.filterTasks({ keyword });
  res.status(200).json({ success: true, ...result });
};

/**
 * GET /api/tasks/assignee/:name
 * Belirli bir sorumluya atanan görevleri listeler.
 */
const getTasksByAssignee = (req, res) => {
  const result = taskStore.filterTasks({ assignee: req.params.name });
  res.status(200).json({ success: true, assignee: req.params.name, ...result });
};

/**
 * POST /api/tasks
 * Yeni görev oluşturur.
 */
const createTask = (req, res) => {
  const task = taskStore.createTask(req.body);
  res.status(201).json({
    success: true,
    message: "Görev başarıyla oluşturuldu.",
    task,
  });
};

/**
 * PUT /api/tasks/:id
 * Görevi tamamen günceller (kısmi güncelleme de desteklenir).
 */
const updateTask = (req, res) => {
  const task = taskStore.updateTask(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Görev bulunamadı: ID ${req.params.id}`,
    });
  }
  res.status(200).json({
    success: true,
    message: "Görev başarıyla güncellendi.",
    task,
  });
};

/**
 * DELETE /api/tasks/:id
 * Görevi sistemden kaldırır.
 */
const deleteTask = (req, res) => {
  const deleted = taskStore.deleteTask(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Görev bulunamadı: ID ${req.params.id}`,
    });
  }
  res.status(200).json({
    success: true,
    message: `Görev başarıyla silindi: ID ${req.params.id}`,
  });
};

module.exports = {
  getAllTasks,
  getTaskById,
  searchTasks,
  getTasksByAssignee,
  createTask,
  updateTask,
  deleteTask,
};
