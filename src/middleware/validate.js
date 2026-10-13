/**
 * Validation Middleware (İsteğe Bağlı 02)
 * Görev oluşturma ve güncelleme için alan doğrulaması.
 * Geçersiz veya eksik veri gönderildiğinde 400 Bad Request döner.
 */

const VALID_PRIORITIES = ["low", "medium", "high", "critical"];
const VALID_STATUSES = ["todo", "in-progress", "completed", "cancelled"];

/**
 * Yeni görev oluştururken zorunlu alan kontrolü
 */
const validateCreateTask = (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Doğrulama hatası",
      errors: ["Geçersiz istek gövdesi (JSON nesnesi bekleniyor)."],
    });
  }

  const { title, description, priority, status, assignee } = req.body;
  const errors = [];

  // title — zorunlu, string, en az 3, en fazla 100 karakter
  if (title === undefined || title === null || title === "") {
    errors.push("'title' alanı zorunludur.");
  } else if (typeof title !== "string") {
    errors.push("'title' alanı metin (string) olmalıdır.");
  } else if (title.trim().length < 3) {
    errors.push("'title' en az 3 karakter olmalıdır.");
  } else if (title.trim().length > 100) {
    errors.push("'title' en fazla 100 karakter olabilir.");
  }

  // description — isteğe bağlı, gönderilirse string olmalı
  if (description !== undefined && description !== null && typeof description !== "string") {
    errors.push("'description' alanı metin (string) olmalıdır.");
  }

  // priority — zorunlu, enum
  if (!priority) {
    errors.push("'priority' alanı zorunludur.");
  } else if (!VALID_PRIORITIES.includes(priority)) {
    errors.push(
      `'priority' şu değerlerden biri olmalıdır: ${VALID_PRIORITIES.join(", ")}`
    );
  }

  // status — isteğe bağlı, gönderilirse enum olmalı
  if (status !== undefined && status !== null && !VALID_STATUSES.includes(status)) {
    errors.push(
      `'status' şu değerlerden biri olmalıdır: ${VALID_STATUSES.join(", ")}`
    );
  }

  // assignee — isteğe bağlı, gönderilirse string ve min 2 karakter olmalı
  if (assignee !== undefined && assignee !== null) {
    if (typeof assignee !== "string") {
      errors.push("'assignee' alanı metin (string) olmalıdır.");
    } else if (assignee.trim().length < 2) {
      errors.push("'assignee' en az 2 karakter olmalıdır.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Doğrulama hatası",
      errors,
    });
  }

  next();
};

/**
 * Görev güncellerken alan kontrolü (kısmi güncelleme destekler)
 */
const validateUpdateTask = (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Doğrulama hatası",
      errors: ["Geçersiz istek gövdesi (JSON nesnesi bekleniyor)."],
    });
  }

  const { title, description, priority, status, assignee } = req.body;
  const errors = [];

  // En az bir geçerli alan gönderilmeli
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Güncelleme için en az bir alan gönderilmelidir.",
    });
  }

  if (title !== undefined && title !== null) {
    if (typeof title !== "string") {
      errors.push("'title' alanı metin (string) olmalıdır.");
    } else if (title.trim().length < 3) {
      errors.push("'title' en az 3 karakter olmalıdır.");
    } else if (title.trim().length > 100) {
      errors.push("'title' en fazla 100 karakter olabilir.");
    }
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    errors.push("'description' alanı metin (string) olmalıdır.");
  }

  if (priority !== undefined && priority !== null && !VALID_PRIORITIES.includes(priority)) {
    errors.push(
      `'priority' şu değerlerden biri olmalıdır: ${VALID_PRIORITIES.join(", ")}`
    );
  }

  if (status !== undefined && status !== null && !VALID_STATUSES.includes(status)) {
    errors.push(
      `'status' şu değerlerden biri olmalıdır: ${VALID_STATUSES.join(", ")}`
    );
  }

  if (assignee !== undefined && assignee !== null) {
    if (typeof assignee !== "string") {
      errors.push("'assignee' alanı metin (string) olmalıdır.");
    } else if (assignee.trim().length < 2) {
      errors.push("'assignee' en az 2 karakter olmalıdır.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Doğrulama hatası",
      errors,
    });
  }

  next();
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  VALID_PRIORITIES,
  VALID_STATUSES,
};
