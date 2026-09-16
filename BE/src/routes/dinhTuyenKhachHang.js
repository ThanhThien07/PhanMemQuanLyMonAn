/**
 * @file dinhTuyenKhachHang.js
 * @description Định tuyến các API liên quan đến Khách hàng Thân thiết & CRM (Customer Routes).
 * - GET  /api/customers: Danh sách khách hàng thân thiết
 * - POST /api/customers: Đăng ký khách hàng mới
 * @module routes/dinhTuyenKhachHang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import { layDanhSachKhachHang, taoKhachHangMoi } from '../controllers/khachHangController.js';
import { xacThucNguoiDung } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/', layDanhSachKhachHang);
router.post('/', xacThucNguoiDung, taoKhachHangMoi);

export default router;
