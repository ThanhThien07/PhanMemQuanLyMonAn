/**
 * @file dinhTuyenBanAn.js
 * @description Định tuyến các API liên quan đến Bàn ăn & Sơ đồ mặt bằng (Table Routes).
 * - GET   /api/tables: Danh sách bàn ăn
 * - GET   /api/tables/:id: Chi tiết bàn (Dành cho khách quét QR)
 * - POST  /api/tables: Thêm bàn mới (admin)
 * - PATCH /api/tables/:id/status: Đổi trạng thái bàn
 * - PATCH /api/tables/:id/guests: Cập nhật số lượng khách
 * - POST  /api/tables/:id/call-waiter: Khách gọi nhân viên phục vụ
 * - POST  /api/tables/:id/request-payment: Khách gửi yêu cầu thanh toán
 * - POST  /api/tables/:id/review: Khách gửi đánh giá bữa ăn
 * @module routes/dinhTuyenBanAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachBan,
  layChiTietBan,
  capNhatTrangThaiBan,
  capNhatSoLuongKhach,
  goiNhanVienPhucVu,
  yeuCauThanhToan,
  guiDanhGiaPhanHoi,
  taoBanMoi
} from '../controllers/banAnController.js';
import { xacThucNguoiDung, phanQuyen } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/', layDanhSachBan);
router.get('/:id', layChiTietBan);
router.post('/', xacThucNguoiDung, phanQuyen('admin'), taoBanMoi);
router.patch('/:id/status', xacThucNguoiDung, capNhatTrangThaiBan);

// Các cổng API mở tự do cho khách hàng quét mã QR tại bàn (không yêu cầu JWT nhân viên)
router.patch('/:id/guests', capNhatSoLuongKhach);
router.post('/:id/call-waiter', goiNhanVienPhucVu);
router.post('/:id/request-payment', yeuCauThanhToan);
router.post('/:id/review', guiDanhGiaPhanHoi);

export default router;
