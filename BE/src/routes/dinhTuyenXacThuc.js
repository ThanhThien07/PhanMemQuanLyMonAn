/**
 * @file dinhTuyenXacThuc.js
 * @description Định tuyến các API liên quan đến Xác thực & Quản lý Tài khoản (Authentication Routes).
 * - POST /api/auth/login: Đăng nhập nhân viên
 * - POST /api/auth/register: Đăng ký tài khoản
 * - GET  /api/auth/me: Lấy thông tin cá nhân
 * - GET  /api/auth/demo-accounts: Lấy danh sách tài khoản demo
 * @module routes/dinhTuyenXacThuc
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import { dangNhap, dangKy, layThongTinCaNhan, layTaiKhoanDemo } from '../controllers/xacThucController.js';
import { xacThucNguoiDung } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.post('/login', dangNhap);
router.post('/register', dangKy);
router.get('/me', xacThucNguoiDung, layThongTinCaNhan);
router.get('/demo-accounts', layTaiKhoanDemo);

export default router;
