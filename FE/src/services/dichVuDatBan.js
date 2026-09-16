/**
 * @file dichVuDatBan.js
 * @description Tầng dịch vụ Client gọi API Quản lý Đặt bàn trước.
 * @module services/dichVuDatBan
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuDatBan = {
  /** Lấy danh sách phiếu hẹn đặt bàn */
  layDanhSachDatBan: (thamSo) => clientAxios.get('/reservations', { params: thamSo }),
  /** Khởi tạo phiếu đặt bàn mới */
  taoLichDatBan: (duLieu) => clientAxios.post('/reservations', duLieu),
  /** Khách đến nhận bàn (Check-in) */
  khachNhanBanCheckIn: (id) => clientAxios.patch(`/reservations/${id}/checkin`),
  /** Hủy lịch đặt bàn */
  huyLichDatBan: (id) => clientAxios.patch(`/reservations/${id}/cancel`),

  // Bí danh tương thích
  getReservations: (params) => clientAxios.get('/reservations', { params }),
  createReservation: (data) => clientAxios.post('/reservations', data),
  checkin: (id) => clientAxios.patch(`/reservations/${id}/checkin`),
  cancel: (id) => clientAxios.patch(`/reservations/${id}/cancel`)
};

export const reservationService = dichVuDatBan;

export default dichVuDatBan;
