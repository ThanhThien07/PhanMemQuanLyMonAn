/**
 * @file xuLyLoiHeThong.js
 * @description Bộ lọc bắt lỗi tập trung toàn cục (Global Centralized Error Handling Middleware):
 * 1. xuLyLoiToanCuc (errorHandler): Tiếp nhận toàn bộ exception/lỗi chưa được xử lý từ các controller,
 *    ghi vết chi tiết (Stack trace) trên server và trả về phản hồi JSON an toàn cho Client.
 * 2. xuLyKhongTimThay (notFoundHandler): Bắt các yêu cầu truy cập sai đường dẫn URL (HTTP 404 Route Not Found).
 * @module middlewares/xuLyLoiHeThong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { phanHoiLoi } from '../utils/chuanHoaPhanHoi.js';
import { ghiLog } from '../utils/ghiNhatKyLog.js';

/**
 * Middleware xử lý lỗi toàn cục của ứng dụng
 * @function xuLyLoiToanCuc
 * @param {Error} err - Đối tượng lỗi phát sinh
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {Function} next - Express Next callback
 */
export function xuLyLoiToanCuc(err, req, res, next) {
  const maTrangThai = err.statusCode || 500;
  const thongDiep = err.message || 'Đã xảy ra lỗi máy chủ nội bộ.';

  // Ghi nhật ký chi tiết lỗi vào terminal để hỗ trợ lập trình viên kiểm tra nhanh
  ghiLog.error(`[${req.method}] ${req.originalUrl} - (${maTrangThai}) ${thongDiep}`);
  if (maTrangThai === 500 && err.stack) {
    console.error(err.stack);
  }

  return phanHoiLoi(
    res,
    thongDiep,
    maTrangThai,
    process.env.NODE_ENV === 'development' ? { stack: err.stack, details: err.errors } : err.errors
  );
}

/**
 * Middleware xử lý khi không tìm thấy Endpoint (HTTP 404 Not Found)
 * @function xuLyKhongTimThay
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export function xuLyKhongTimThay(req, res) {
  const thongBao = `Không tìm thấy endpoint [${req.method}] ${req.originalUrl} trên hệ thống máy chủ.`;
  ghiLog.warn(thongBao);
  return phanHoiLoi(res, thongBao, 404);
}

// Giữ các bí danh tiếng Anh để tương thích
export const errorHandler = xuLyLoiToanCuc;
export const notFoundHandler = xuLyKhongTimThay;

export default {
  xuLyLoiToanCuc,
  xuLyKhongTimThay,
  errorHandler,
  notFoundHandler
};
