const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, "requests.log");

/**
 * Logger Middleware (Asama 03 — Temel Middleware)
 * Tum API isteklerini method, endpoint, yanit kodu ve zaman damgasiyla
 * konsola ve logs/requests.log dosyasina kaydeder.
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const logEntry = `[${timestamp}] ${method} ${url} -> ${statusCode}`;

    console.log(logEntry);

    fs.appendFile(logFilePath, logEntry + "\n", (err) => {
      if (err) {
        console.error("Log dosyasina yazilamadi:", err.message);
      }
    });
  });

  next();
};

module.exports = logger;
