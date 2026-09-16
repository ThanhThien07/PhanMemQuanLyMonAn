/**
 * @file kiemTraXacThuc.js
 * @description Bộ đôi Middleware kiểm soát bảo mật và phân quyền người dùng:
 * 1. xacThucNguoiDung (authenticate): Kiểm tra tính hợp lệ của Header Authorization Bearer JWT Token.
 * 2. phanQuyen (authorize): Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC).
 * Đảm bảo tài khoản có đúng quyền (admin, nhan_vien, bep, thu_ngan) mới được phép gọi API tương ứng.
 * @module middlewares/kiemTraXacThuc
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { xacThucMaToken } from '../config/cauHinhJWT.js';

/**
 * Middleware xác thực danh tính người dùng qua JWT Bearer Token
 * @function xacThucNguoiDung
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {Function} next - Express Next callback
 */
export function xacThucNguoiDung(req, res, next) {
  const tieuDeAuth = req.headers.authorization;
  
  if (!tieuDeAuth || !tieuDeAuth.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để thực hiện thao tác này (Thiếu mã token Bearer).'
    });
  }

  const chuoiToken = tieuDeAuth.split(' ')[1];
  const payloadGiaiMa = xacThucMaToken(chuoiToken);

  if (!payloadGiaiMa) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }

  // Đính kèm thông tin người dùng đã giải mã vào req.user để các controller tiếp theo sử dụng
  req.user = payloadGiaiMa;
  next();
}

/**
 * Middleware kiểm tra phân quyền truy cập theo vai trò (RBAC)
 * @function phanQuyen
 * @param  {...string} danhSachVaiTroChoPhep - Danh sách các vai trò được cấp phép ('admin', 'bep', 'thu_ngan'...)
 * @returns {Function} Express Middleware
 */
export function phanQuyen(...danhSachVaiTroChoPhep) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực danh tính người dùng.'
      });
    }

    // Quản trị viên 'admin' luôn có quyền truy cập tối cao vào tất cả các endpoint
    if (!danhSachVaiTroChoPhep.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu một trong các quyền: ${danhSachVaiTroChoPhep.join(', ')}`
      });
    }

    next();
  };
}

// Giữ các bí danh tiếng Anh để tương thích
export const authenticate = xacThucNguoiDung;
export const authorize = phanQuyen;

export default {
  xacThucNguoiDung,
  phanQuyen,
  authenticate,
  authorize
};
