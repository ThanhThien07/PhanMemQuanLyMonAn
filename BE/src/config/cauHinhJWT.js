/**
 * @file cauHinhJWT.js
 * @description Quản lý cấu hình, phát hành và xác thực JSON Web Token (JWT) cho hệ thống.
 * Áp dụng thuật toán HMAC-SHA256 để ký số và bảo vệ an toàn cho các phiên làm việc của nhân viên.
 * @module config/cauHinhJWT
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Khóa bí mật dùng để ký và giải mã JWT Token (ưu tiên đọc từ biến môi trường JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'quan_ly_nha_hang_secret_jwt_key_2026';

// Thời gian hiệu lực của Token: mặc định 7 ngày
const JWT_EXPIRES_IN = '7d';

/**
 * Phát hành chuỗi JWT Token chứa payload thông tin định danh của người dùng
 * @function taoMaToken
 * @param {Object} nguoiDung - Đối tượng người dùng đã xác thực
 * @param {number|string} nguoiDung.id - Mã định danh người dùng
 * @param {string} nguoiDung.email - Địa chỉ email đăng nhập
 * @param {string} nguoiDung.name - Họ tên người dùng
 * @param {string} nguoiDung.role - Vai trò phân quyền ('admin', 'nhan_vien', 'bep', 'thu_ngan')
 * @returns {string} Chuỗi JWT Token hoàn chỉnh
 */
export function taoMaToken(nguoiDung) {
  return jwt.sign(
    {
      id: nguoiDung.id,
      email: nguoiDung.email,
      name: nguoiDung.name,
      role: nguoiDung.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Giải mã và kiểm tra tính hợp lệ của chuỗi JWT Token
 * @function xacThucMaToken
 * @param {string} token - Chuỗi Bearer token cần kiểm tra
 * @returns {Object|null} Payload giải mã nếu hợp lệ, ngược lại trả về null
 */
export function xacThucMaToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Giữ bí danh tương thích cho hệ thống cũ
export const generateToken = taoMaToken;
export const verifyToken = xacThucMaToken;

export default {
  taoMaToken,
  xacThucMaToken,
  generateToken,
  verifyToken
};
