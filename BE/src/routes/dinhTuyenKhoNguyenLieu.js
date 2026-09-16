/**
 * @file dinhTuyenKhoNguyenLieu.js
 * @description Định tuyến các API liên quan đến Quản lý Kho Thực Phẩm & Nhà Cung Cấp (Inventory Routes).
 * - GET   /api/inventory/ingredients: Danh sách nguyên liệu kho
 * - POST  /api/inventory/ingredients: Thêm nguyên liệu mới (admin, bep)
 * - PATCH /api/inventory/ingredients/:id/stock: Nhập thêm / điều chỉnh tồn kho
 * - GET   /api/inventory/suppliers: Danh sách nhà cung cấp
 * @module routes/dinhTuyenKhoNguyenLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachNguyenLieu,
  themNguyenLieuMoi,
  capNhatTonKho,
  layDanhSachNhaCungCap
} from '../controllers/khoNguyenLieuController.js';
import { xacThucNguoiDung, phanQuyen } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/ingredients', layDanhSachNguyenLieu);
router.post('/ingredients', xacThucNguoiDung, phanQuyen('admin', 'bep'), themNguyenLieuMoi);
router.patch('/ingredients/:id/stock', xacThucNguoiDung, capNhatTonKho);
router.get('/suppliers', layDanhSachNhaCungCap);

export default router;
