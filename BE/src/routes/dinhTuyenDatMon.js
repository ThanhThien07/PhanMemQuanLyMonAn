/**
 * @file dinhTuyenDatMon.js
 * @description Định tuyến các API liên quan đến Gọi món, Bếp KDS & Thanh toán (Order Routes).
 * - GET   /api/orders: Danh sách đơn gọi món
 * - GET   /api/orders/kitchen: Hàng đợi món cho màn hình Bếp KDS
 * - POST  /api/orders: Tạo đơn gọi món mới (POS & Khách quét QR)
 * - PATCH /api/orders/:id/status: Đổi trạng thái món & tự động trừ kho BOM
 * - POST  /api/orders/pay/:ban_id: Thanh toán hóa đơn bàn ăn
 * @module routes/dinhTuyenDatMon
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachDonMon,
  layDonMonChoBep,
  taoDonGoiMon,
  capNhatTrangThaiDonMon,
  thanhToanHoaDon
} from '../controllers/datMonController.js';
import { xacThucNguoiDung } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/', layDanhSachDonMon);
router.get('/kitchen', layDonMonChoBep);
// Cho phép cả POS lẫn khách tự quét QR gửi order
router.post('/', taoDonGoiMon);
router.patch('/:id/status', xacThucNguoiDung, capNhatTrangThaiDonMon);
router.post('/pay/:ban_id', xacThucNguoiDung, thanhToanHoaDon);

export default router;
