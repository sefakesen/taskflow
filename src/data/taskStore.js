const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "tasks.json");

// Varsayılan tohum verisi (seed)
const DEFAULT_TASKS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "API endpoint'lerini geliştir",
    description: "TaskFlow REST API endpoint'lerinin tamamını yaz ve test et.",
    status: "in-progress",
    priority: "high",
    assignee: "musa",
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-05T14:30:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    title: "Veritabanı şeması tasarla",
    description: "PostgreSQL için tablo ve ilişki yapısını tasarla.",
    status: "completed",
    priority: "critical",
    assignee: "ayse",
    createdAt: "2026-10-02T08:00:00.000Z",
    updatedAt: "2026-10-03T17:00:00.000Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    title: "Frontend tasarımını hazırla",
    description: "Arayüz wireframe ve Figma tasarımlarını tamamla.",
    status: "todo",
    priority: "medium",
    assignee: "ali",
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    title: "Birim testlerini yaz",
    description: "Tüm servis fonksiyonları için Jest testleri oluştur.",
    status: "todo",
    priority: "low",
    assignee: "musa",
    createdAt: "2026-10-04T11:00:00.000Z",
    updatedAt: "2026-10-04T11:00:00.000Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    title: "Sunucu altyapısını kur",
    description: "AWS EC2 üzerinde production ortamını hazırla.",
    status: "cancelled",
    priority: "high",
    assignee: "zeynep",
    createdAt: "2026-10-05T09:00:00.000Z",
    updatedAt: "2026-10-06T09:00:00.000Z",
  },
];

/**
 * Dosyadan görevleri okur; dosya yoksa veya bozuksa varsayılanları yazar.
 */
function loadTasks() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Görev verisi dosyadan okunamadı, varsayılanlar yükleniyor:", error.message);
  }
  saveTasksToFile(DEFAULT_TASKS);
  return [...DEFAULT_TASKS];
}

/**
 * Görev listesini JSON dosyasına kaydeder.
 */
function saveTasksToFile(tasksToSave) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasksToSave, null, 2), "utf-8");
  } catch (error) {
    console.error("Görev verisi dosyaya yazılamadı:", error.message);
  }
}

// In-memory aktif veri listesi
let tasks = loadTasks();

/**
 * Tüm görevleri döner
 */
const getAllTasks = () => tasks;

/**
 * ID'ye göre tek görev döner; bulunamazsa null
 */
const getTaskById = (id) => tasks.find((t) => t.id === id) || null;

/**
 * Yeni görev oluşturur ve listeye ekler
 */
const createTask = (data) => {
  const newTask = {
    id: uuidv4(),
    title: data.title.trim(),
    description: data.description ? data.description.trim() : "",
    status: data.status ? data.status.trim() : "todo", // varsayılan "todo"
    priority: data.priority,
    assignee: data.assignee ? data.assignee.trim() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasksToFile(tasks);
  return newTask;
};

/**
 * Var olan görevi günceller (kısmi güncelleme)
 */
const updateTask = (id, data) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const allowedFields = ["title", "description", "status", "priority", "assignee"];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      tasks[index][field] =
        typeof data[field] === "string" ? data[field].trim() : data[field];
    }
  });
  tasks[index].updatedAt = new Date().toISOString();
  saveTasksToFile(tasks);

  return tasks[index];
};

/**
 * Görevi siler; başarıysa true, bulunamazsa false
 */
const deleteTask = (id) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  saveTasksToFile(tasks);
  return true;
};

/**
 * Görevleri filtreler, arar, sıralar ve sayfalar (İsteğe Bağlı 01)
 */
const filterTasks = (query) => {
  let result = [...tasks];

  // Durum filtresi
  if (query.status) {
    result = result.filter((t) => t.status === query.status);
  }

  // Öncelik filtresi
  if (query.priority) {
    result = result.filter((t) => t.priority === query.priority);
  }

  // Sorumlu filtresi
  if (query.assignee) {
    result = result.filter(
      (t) => t.assignee && t.assignee.toLowerCase() === query.assignee.toLowerCase()
    );
  }

  // Anahtar kelime arama (title ve description içinde)
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    result = result.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(kw)) ||
        (t.description && t.description.toLowerCase().includes(kw))
    );
  }

  // Toplam kayıt (sayfalama öncesi filtrelenmiş sayı)
  const total = result.length;

  // Sıralama
  if (query.sort) {
    const sortField = query.sort;
    const order = query.order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  }

  // Sayfalama
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || total;
  const startIndex = (page - 1) * limit;
  const paginated = result.slice(startIndex, startIndex + limit);

  return {
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    tasks: paginated,
  };
};

/**
 * Test ve sıfırlama için veri tabanını varsayılan tohum verisine döndürür
 */
const resetTasks = (seed = DEFAULT_TASKS) => {
  tasks = JSON.parse(JSON.stringify(seed));
  saveTasksToFile(tasks);
  return tasks;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  filterTasks,
  resetTasks,
  DEFAULT_TASKS,
};
