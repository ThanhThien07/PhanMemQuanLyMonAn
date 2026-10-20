/**
 * @file dinhTuyenNguoiDung.js
 * @description Định tuyến các API liên quan đến Quản lý Tài khoản & Phân quyền Người Dùng / Khách Hàng (User Routes).
 * Chỉ dành cho Quản lý (Admin):
 * - GET    /api/users: Danh sách tài khoản
 * - POST   /api/users: Tạo tài khoản mới
 * - PUT    /api/users/:id: Cập nhật thông tin tài khoản
 * - PATCH  /api/users/:id/status: Đổi trạng thái khóa / mở khóa tài khoản
 * - DELETE /api/users/:id: Xóa tài khoản
 * @module routes/dinhTuyenNguoiDung
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachTaiKhoan,
  taoTaiKhoanMoi,
  capNhatTaiKhoan,
  doiTrangThaiTaiKhoan,
  xoaTaiKhoan
} from '../controllers/nguoiDungController.js';
import { xacThucNguoiDung, phanQuyen } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

// Áp dụng bảo vệ: bắt buộc đăng nhập và chỉ cấp quyền cho Admin
router.use(xacThucNguoiDung);
router.use(phanQuyen('admin'));

router.get('/', layDanhSachTaiKhoan);
router.post('/', taoTaiKhoanMoi);
router.put('/:id', capNhatTaiKhoan);
router.patch('/:id/status', doiTrangThaiTaiKhoan);
router.delete('/:id', xoaTaiKhoan);

export default router;
