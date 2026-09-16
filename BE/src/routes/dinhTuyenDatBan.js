/**
 * @file dinhTuyenDatBan.js
 * @description Định tuyến các API liên quan đến Quản lý Đặt bàn trước (Reservation Routes).
 * - GET   /api/reservations: Danh sách phiếu đặt bàn
 * - POST  /api/reservations: Khởi tạo phiếu đặt bàn mới
 * - PATCH /api/reservations/:id/checkin: Khách đến nhận bàn (check-in)
 * - PATCH /api/reservations/:id/cancel: Hủy lịch đặt bàn
 * @module routes/dinhTuyenDatBan
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import {
  layDanhSachDatBan,
  taoLichDatBan,
  khachNhanBanCheckIn,
  huyLichDatBan
} from '../controllers/datBanController.js';
import { xacThucNguoiDung } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/', layDanhSachDatBan);
router.post('/', xacThucNguoiDung, taoLichDatBan);
router.patch('/:id/checkin', xacThucNguoiDung, khachNhanBanCheckIn);
router.patch('/:id/cancel', xacThucNguoiDung, huyLichDatBan);

export default router;
