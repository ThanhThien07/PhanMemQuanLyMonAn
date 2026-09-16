/**
 * @file dichVuBaoCao.js
 * @description Tầng dịch vụ Client gọi API Báo cáo & Phân tích Dashboard.
 * @module services/dichVuBaoCao
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuBaoCao = {
  /** Lấy dữ liệu tổng quan thống kê cho Dashboard */
  layThongKeTongHop: () => clientAxios.get('/reports/summary'),

  // Bí danh tương thích
  getSummary: () => clientAxios.get('/reports/summary')
};

export const reportService = dichVuBaoCao;

export default dichVuBaoCao;
