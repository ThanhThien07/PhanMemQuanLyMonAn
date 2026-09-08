import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Global Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã xảy ra lỗi máy chủ nội bộ.';

  // Log chi tiết lỗi kèm stack trace để dễ debug
  logger.error(`[${req.method}] ${req.originalUrl} - (${statusCode}) ${message}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack, details: err.errors } : err.errors
  );
}

/**
 * Middleware xử lý 404 Route Not Found
 */
export function notFoundHandler(req, res) {
  const msg = `Không tìm thấy endpoint [${req.method}] ${req.originalUrl} trên hệ thống.`;
  logger.warn(msg);
  return errorResponse(res, msg, 404);
}

export default {
  errorHandler,
  notFoundHandler
};
