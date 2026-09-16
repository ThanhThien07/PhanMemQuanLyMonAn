/**
 * @file dichVuDatMon.js
 * @description Tầng dịch vụ Client gọi API Quản lý Bán hàng POS, Gọi món & Màn hình Bếp KDS.
 * @module services/dichVuDatMon
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuDatMon = {
  /** Lấy danh sách các đơn gọi món */
  layDanhSachDonMon: (thamSo) => clientAxios.get('/orders', { params: thamSo }),
  /** Lấy hàng đợi món cho Màn hình Bếp KDS */
  layDonMonChoBep: () => clientAxios.get('/orders/kitchen'),
  /** Tạo đơn gọi món mới (POS & Khách quét QR) */
  taoDonGoiMon: (duLieu) => clientAxios.post('/orders', duLieu),
  /** Cập nhật trạng thái chế biến món ăn */
  capNhatTrangThai: (id, trangThai) => clientAxios.patch(`/orders/${id}/status`, { trang_thai: trangThai }),
  /** Thanh toán toàn bộ hóa đơn cho một bàn */
  thanhToanHoaDon: (banId, duLieu) => clientAxios.post(`/orders/pay/${banId}`, duLieu),

  // Bí danh tương thích
  getOrders: (params) => clientAxios.get('/orders', { params }),
  getKitchenOrders: () => clientAxios.get('/orders/kitchen'),
  createOrder: (data) => clientAxios.post('/orders', data),
  updateStatus: (id, status) => clientAxios.patch(`/orders/${id}/status`, { trang_thai: status }),
  payBill: (banId, data) => clientAxios.post(`/orders/pay/${banId}`, data)
};

export const orderService = dichVuDatMon;

export default dichVuDatMon;
