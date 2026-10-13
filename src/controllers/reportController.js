const taskStore = require("../data/taskStore");

/**
 * GET /reports/summary veya /api/reports/summary
 * Genel sistem ozeti: durum dagilimi, oncelik dagilimi ve tamamlama orani.
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
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }

    if (priorityCounts[task.priority] !== undefined) {
      priorityCounts[task.priority]++;
    }

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
 * GET /reports/completed veya /api/reports/completed
 * Tamamlanan gorevlerin sayisi ve listesi.
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
 * GET /reports/pending veya /api/reports/pending
 * Bekleyen gorevlerin sayisi ve listesi (todo ve in-progress).
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

module.exports = { getSummary, getCompleted, getPending };
