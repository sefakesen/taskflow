const fs = require("fs");
const path = require("path");

// Log dosyası için klasör oluştur
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, "requests.log");

/**
 * Logger Middleware (Aşama 3 — Temel Middleware)
 * Tüm API isteklerini method, endpoint, yanıt kodu, süre ve zaman damgasıyla
 * hem konsola hem de logs/requests.log dosyasına kayıt altına alır.
 */
const logger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || (req.socket && req.socket.remoteAddress) || "-";

  // Yanıt tamamlandığında logla
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logEntry = `[${timestamp}] ${method} ${url} → ${statusCode} (${duration}ms) | IP: ${ip}`;

    // Konsol renkleri
    const color =
      statusCode >= 500
        ? "\x1b[31m" // Kırmızı
        : statusCode >= 400
        ? "\x1b[33m" // Sarı
        : "\x1b[32m"; // Yeşil
    console.log(`${color}${logEntry}\x1b[0m`);

    // Dosyaya asenkron yaz
    fs.appendFile(logFilePath, logEntry + "\n", (err) => {
      if (err) {
        console.error("Log dosyasına yazılamadı:", err.message);
      }
    });
  });

  next();
};

module.exports = logger;
