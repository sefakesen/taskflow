/**
 * Global Error Handler Middleware
 * Beklenmeyen hatalari yakalar ve duzenli bir JSON yaniti doner.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Hata] ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Sunucu hatasi",
  });
};

module.exports = errorHandler;
