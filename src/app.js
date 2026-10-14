const express = require("express");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temel Middleware — Istek Loglayici (Asama 03)
app.use(logger);

// Rotalar — Hem /api hem kok rotalar desteklenir
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

app.use("/api/reports", reportRoutes);
app.use("/reports", reportRoutes);

// Saglik Kontrolu (Health Check)
app.get("/", (req, res) => {
  res.status(200).json({
    name: "TaskFlow API",
    version: "1.0.0",
    status: "active",
    message: "TaskFlow REST API calisiyor.",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    name: "TaskFlow API",
    version: "1.0.0",
    status: "active",
    message: "TaskFlow REST API calisiyor.",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint bulunamadi: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Sunucu Baslatma
const server = app.listen(PORT, () => {
  console.log(`TaskFlow API sunucusu baslatildi: http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[Hata] ${PORT} numarali port baska bir surec tarafindan kullaniliyor.`);
  } else {
    console.error("Sunucu baslatma hatasi:", err.message);
  }
  process.exit(1);
});

module.exports = app;
