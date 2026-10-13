/**
 * Global Error Handler Middleware
 * Tüm beklenmedik hataları yakalar ve düzenli bir JSON yanıtı döner.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`\x1b[31m[HATA] ${err.message}\x1b[0m`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Sunucu hatası",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
