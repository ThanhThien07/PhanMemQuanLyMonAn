/**
 * @file dinhTuyenBaoCao.js
 * @description Định tuyến các API liên quan đến Báo cáo Doanh thu & Thống kê Dashboard (Report Routes).
 * - GET /api/reports/summary: Tổng hợp doanh thu, cơ cấu bàn, cảnh báo kho, top món bán chạy
 * @module routes/dinhTuyenBaoCao
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import { layThongKeTongQuan } from '../controllers/baoCaoController.js';
import { xacThucNguoiDung } from '../middlewares/kiemTraXacThuc.js';

const router = express.Router();

router.get('/summary', xacThucNguoiDung, layThongKeTongQuan);

export default router;
