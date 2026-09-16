/**
 * @file dinhTuyenMonAn.js
 * @description Định tuyến các API liên quan đến Thực đơn & Món ăn (Dish Routes).
 * - GET    /api/dishes/categories: Danh mục nhóm món
 * - GET    /api/dishes: Danh sách món ăn
 * - GET    /api/dishes/:id: Chi tiết món ăn kèm công thức BOM
 * - POST   /api/dishes: Thêm món ăn mới (admin, bep)
 * - PUT    /api/dishes/:id: Cập nhật món ăn (admin, bep)
 * - DELETE /api/dishes/:id: Xóa món ăn (admin)
 * @module routes/dinhTuyenMonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachMonAn,
  layDanhSachLoaiMon,
  layChiTietMonAn,
  themMonAnMoi,
  capNhatMonAn,
  xoaMonAn
} from '../controllers/monAnController.js';
import { xacThucNguoiDung, phanQuyen } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/categories', layDanhSachLoaiMon);
router.get('/', layDanhSachMonAn);
router.get('/:id', layChiTietMonAn);
router.post('/', xacThucNguoiDung, phanQuyen('admin', 'bep'), themMonAnMoi);
router.put('/:id', xacThucNguoiDung, phanQuyen('admin', 'bep'), capNhatMonAn);
router.delete('/:id', xacThucNguoiDung, phanQuyen('admin'), xoaMonAn);

export default router;
