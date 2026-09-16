/**
 * @file ghiNhatKyYeuCau.js
 * @description Middleware tự động ghi nhận nhật ký (Request Logging) cho từng yêu cầu HTTP gửi đến máy chủ.
 * Đo lường chính xác thời gian xử lý (Response Time - Duration ms), phương thức HTTP, đường dẫn URL và mã trạng thái HTTP trả về.
 * @module middlewares/ghiNhatKyYeuCau
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { ghiLog } from '../utils/ghiNhatKyLog.js';

/**
 * Ghi vết mọi yêu cầu HTTP
 * @function ghiNhatKyYeuCau
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {Function} next - Express Next callback
 */
export function ghiNhatKyYeuCau(req, res, next) {
  const thoiDiemBatDau = Date.now();

  res.on('finish', () => {
    const thoiGianXuLy = Date.now() - thoiDiemBatDau;
    ghiLog.http(req.method, req.originalUrl, res.statusCode, thoiGianXuLy);
  });

  next();
}

// Bí danh tương thích
export const requestLogger = ghiNhatKyYeuCau;

export default ghiNhatKyYeuCau;
