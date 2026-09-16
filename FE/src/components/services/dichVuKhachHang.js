/**
 * @file dichVuKhachHang.js
 * @description Tầng dịch vụ Client gọi API Quản lý Khách hàng thân thiết & CRM.
 * @module services/dichVuKhachHang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuKhachHang = {
  /** Lấy danh sách thành viên thân thiết */
  layDanhSachKhachHang: (thamSo) => clientAxios.get('/customers', { params: thamSo }),
  /** Thêm mới khách hàng vào CRM */
  taoKhachHangMoi: (duLieu) => clientAxios.post('/customers', duLieu),

  // Bí danh tương thích
  getCustomers: (params) => clientAxios.get('/customers', { params }),
  createCustomer: (data) => clientAxios.post('/customers', data)
};

export const customerService = dichVuKhachHang;

export default dichVuKhachHang;
