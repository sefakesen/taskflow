const taskStore = require("../data/taskStore");

/**
 * GET /api/reports/summary
 * Genel sistem özeti — tüm durumların sayısı ve öncelik dağılımı
 */
const getSummary = (req, res) => {
  const tasks = taskStore.getAllTasks();

  const statusCounts = {
    todo: 0,
    "in-progress": 0,
    completed: 0,
    cancelled: 0,
  };

  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const assigneeCounts = {};

  tasks.forEach((task) => {
    // Durum sayımı
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }

    // Öncelik sayımı
    if (priorityCounts[task.priority] !== undefined) {
      priorityCounts[task.priority]++;
    }

    // Sorumlu başına görev sayısı
    if (task.assignee) {
      assigneeCounts[task.assignee] = (assigneeCounts[task.assignee] || 0) + 1;
    }
  });

  res.status(200).json({
    success: true,
    summary: {
      totalTasks: tasks.length,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      byAssignee: assigneeCounts,
      completionRate:
        tasks.length > 0
          ? `${Math.round((statusCounts.completed / tasks.length) * 100)}%`
          : "0%",
    },
  });
};

/**
 * GET /api/reports/completed
 * Tamamlanan görevlerin sayısı ve listesi
 */
const getCompleted = (req, res) => {
  const tasks = taskStore.getAllTasks();
  const completed = tasks.filter((t) => t.status === "completed");

  res.status(200).json({
    success: true,
    count: completed.length,
    tasks: completed,
  });
};

/**
 * GET /api/reports/pending
 * Bekleyen görevlerin sayısı ve listesi (todo + in-progress)
 */
const getPending = (req, res) => {
  const tasks = taskStore.getAllTasks();
  const pending = tasks.filter(
    (t) => t.status === "todo" || t.status === "in-progress"
  );

  res.status(200).json({
    success: true,
    count: pending.length,
    breakdown: {
      todo: pending.filter((t) => t.status === "todo").length,
      "in-progress": pending.filter((t) => t.status === "in-progress").length,
    },
    tasks: pending,
  });
};

/**
 * GET /api/reports/overdue
 * Kritik öncelikli ve hâlâ tamamlanmamış görevler
 */
const getCritical = (req, res) => {
  const tasks = taskStore.getAllTasks();
  const critical = tasks.filter(
    (t) => t.priority === "critical" && t.status !== "completed" && t.status !== "cancelled"
  );

  res.status(200).json({
    success: true,
    count: critical.length,
    tasks: critical,
  });
};

module.exports = { getSummary, getCompleted, getPending, getCritical };
