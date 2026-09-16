/**
 * @file dichVuBanAn.js
 * @description Tầng dịch vụ Client gọi API Quản lý Bàn ăn & Sơ đồ nhà hàng.
 * @module services/dichVuBanAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuBanAn = {
  /** Lấy danh sách bàn ăn kèm số món và tạm tính */
  layDanhSachBan: (thamSo) => clientAxios.get('/tables', { params: thamSo }),
  /** Lấy chi tiết một bàn (cho khách quét QR) */
  layChiTietBan: (id) => clientAxios.get(`/tables/${id}`),
  /** Thêm bàn mới (Admin) */
  taoBanMoi: (duLieu) => clientAxios.post('/tables', duLieu),
  /** Cập nhật trạng thái bàn */
  capNhatTrangThai: (id, duLieu) => clientAxios.patch(`/tables/${id}/status`, duLieu),
  /** Cập nhật số khách tại bàn */
  capNhatSoKhach: (id, soLuong) => clientAxios.patch(`/tables/${id}/guests`, { so_luong_khach: soLuong }),
  /** Khách quét QR bấm gọi nhân viên */
  goiNhanVien: (id) => clientAxios.post(`/tables/${id}/call-waiter`),
  /** Khách quét QR bấm yêu cầu thanh toán */
  yeuCauThanhToan: (id, phuongThuc) => clientAxios.post(`/tables/${id}/request-payment`, { phuong_thuc: phuongThuc }),
  /** Khách gửi đánh giá */
  guiDanhGia: (id, duLieu) => clientAxios.post(`/tables/${id}/review`, duLieu),

  // Bí danh tương thích
  getTables: (params) => clientAxios.get('/tables', { params }),
  getTableById: (id) => clientAxios.get(`/tables/${id}`),
  createTable: (data) => clientAxios.post('/tables', data),
  updateStatus: (id, data) => clientAxios.patch(`/tables/${id}/status`, data)
};

export const tableService = dichVuBanAn;

export default dichVuBanAn;
