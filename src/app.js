const express = require("express");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true }));

// CORS Desteği — API'nin tüm istemciler tarafından sorunsuz çağrılabilmesi için
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Temel Middleware — İstek Loglayıcı (Aşama 03)
app.use(logger);

// ─── Routes ──────────────────────────────────────────────────
// Hem "/api/..." hem de doğrudan "/..." öneklerini destekler
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

app.use("/api/reports", reportRoutes);
app.use("/reports", reportRoutes);

// ─── Root & Health Check ──────────────────────────────────────
const healthResponse = (req, res) => {
  res.status(200).json({
    project: "TaskFlow — Görev ve Proje Yönetim Sistemi API",
    version: "1.0.0",
    status: "online",
    message: "🚀 TaskFlow REST API başarıyla çalışıyor.",
    endpoints: {
      tasks: {
        list_or_create: "/api/tasks",
        detail_or_update_or_delete: "/api/tasks/:id",
        search: "/api/tasks/search?keyword=backend",
        assignee: "/api/tasks/assignee/:name",
        filter_status: "/api/tasks?status=completed",
        filter_priority: "/api/tasks?priority=high",
        pagination: "/api/tasks?page=1&limit=10",
        sorting: "/api/tasks?sort=createdAt&order=desc",
      },
      reports: {
        summary: "/api/reports/summary",
        pending: "/api/reports/pending",
        completed: "/api/reports/completed",
        critical: "/api/reports/critical",
      },
      documentation: "Tüm detaylar için README.md ve docs/ klasörüne bakın.",
    },
  });
};

app.get("/", healthResponse);
app.get("/api", healthResponse);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint bulunamadı: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Server Start ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`✅ TaskFlow API sunucusu başlatıldı → http://localhost:${PORT}`);
    console.log(`📋 Ortam: ${process.env.NODE_ENV || "development"}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\x1b[31m❌ [Port Çakışması] ${PORT} numaralı port şu anda başka bir işlem tarafından kullanılıyor!\x1b[0m`
      );
      console.error(
        `💡 Çözüm: PowerShell'de şu komutla portu kullanan eski süreci kapatabilirsiniz:`
      );
      console.error(
        `   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`
      );
      console.error(
        `   Veya farklı bir port ile başlatın: $env:PORT=3001; npm run dev`
      );
    } else {
      console.error("Sunucu başlatma hatası:", err);
    }
    process.exit(1);
  });
}

module.exports = app;
