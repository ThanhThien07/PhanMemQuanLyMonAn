/**
 * @file dinhTuyenTongHop.js
 * @description Router tổng hợp toàn bộ các phân hệ định tuyến RESTful API của hệ thống máy chủ Back-End:
 * - /api/auth -> dinhTuyenXacThuc
 * - /api/dishes -> dinhTuyenMonAn
 * - /api/tables -> dinhTuyenBanAn
 * - /api/orders -> dinhTuyenDatMon
 * - /api/reservations -> dinhTuyenDatBan
 * - /api/inventory -> dinhTuyenKhoNguyenLieu
 * - /api/customers -> dinhTuyenKhachHang
 * - /api/reports -> dinhTuyenBaoCao
 * @module routes/dinhTuyenTongHop
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import dinhTuyenXacThuc from './dinhTuyenXacThuc.js';
import dinhTuyenMonAn from './dinhTuyenMonAn.js';
import dinhTuyenBanAn from './dinhTuyenBanAn.js';
import dinhTuyenDatMon from './dinhTuyenDatMon.js';
import dinhTuyenDatBan from './dinhTuyenDatBan.js';
import dinhTuyenKhoNguyenLieu from './dinhTuyenKhoNguyenLieu.js';
import dinhTuyenKhachHang from './dinhTuyenKhachHang.js';
import dinhTuyenBaoCao from './dinhTuyenBaoCao.js';

const router = express.Router();

/**
 * Root API Endpoint - Kiểm tra trạng thái máy chủ (Health Check & Metadata)
 */
router.get('/', (req, res) => {
  res.json({
    ten_du_an: 'Phần Mềm Quản Lý Nhà Hàng & Món Ăn (Royal Bistro REST API)',
    phien_ban: '2.0.0',
    trang_thai: 'ONLINE',
    ngay_cap_nhat: '2026-09-15',
    tac_gia: 'Nhóm 5 - Nguyễn Ngọc Hà Thảo',
    mon_hoc: 'Chuyên Đề Back-End & Node.js RESTful API',
    cac_phan_he_api: {
      xac_thuc: '/api/auth',
      thuc_don: '/api/dishes',
      danh_muc: '/api/dishes/categories',
      so_do_ban: '/api/tables',
      goi_mon: '/api/orders',
      man_hinh_bep: '/api/orders/kitchen',
      dat_ban_truoc: '/api/reservations',
      kho_nguyen_lieu: '/api/inventory/ingredients',
      nha_cung_cap: '/api/inventory/suppliers',
      khach_hang: '/api/customers',
      bao_cao_doanh_thu: '/api/reports/summary'
    }
  });
});

// Đăng ký các phân hệ router con
router.use('/auth', dinhTuyenXacThuc);
router.use('/dishes', dinhTuyenMonAn);
router.use('/tables', dinhTuyenBanAn);
router.use('/orders', dinhTuyenDatMon);
router.use('/reservations', dinhTuyenDatBan);
router.use('/inventory', dinhTuyenKhoNguyenLieu);
router.use('/customers', dinhTuyenKhachHang);
router.use('/reports', dinhTuyenBaoCao);

export default router;
