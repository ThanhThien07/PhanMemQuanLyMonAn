import { logger } from '../utils/logger.js';

/**
 * Middleware ghi log chi tiết mọi request HTTP kèm thời gian phản hồi
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
}

export default requestLogger;
