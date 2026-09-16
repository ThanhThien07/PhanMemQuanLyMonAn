/**
 * @file dichVuMonAn.js
 * @description Tầng dịch vụ Client gọi API Quản lý Thực đơn, Danh mục & Món ăn.
 * @module services/dichVuMonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuMonAn = {
  /** Lấy danh mục các nhóm món ăn */
  layDanhSachLoaiMon: () => clientAxios.get('/dishes/categories'),
  /** Lấy danh sách món ăn */
  layDanhSachMonAn: (thamSo) => clientAxios.get('/dishes', { params: thamSo }),
  /** Lấy thông tin chi tiết món ăn kèm công thức BOM */
  layChiTietMonAn: (id) => clientAxios.get(`/dishes/${id}`),
  /** Thêm món ăn mới */
  themMonAnMoi: (duLieu) => clientAxios.post('/dishes', duLieu),
  /** Cập nhật món ăn */
  capNhatMonAn: (id, duLieu) => clientAxios.put(`/dishes/${id}`, duLieu),
  /** Xóa món ăn khỏi thực đơn */
  xoaMonAn: (id) => clientAxios.delete(`/dishes/${id}`),

  // Bí danh tương thích
  getCategories: () => clientAxios.get('/dishes/categories'),
  getDishes: (params) => clientAxios.get('/dishes', { params }),
  getDishById: (id) => clientAxios.get(`/dishes/${id}`),
  createDish: (data) => clientAxios.post('/dishes', data),
  updateDish: (id, data) => clientAxios.put(`/dishes/${id}`, data),
  deleteDish: (id) => clientAxios.delete(`/dishes/${id}`)
};

export const dishService = dichVuMonAn;

export default dichVuMonAn;
