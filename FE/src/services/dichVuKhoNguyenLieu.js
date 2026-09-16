/**
 * @file dichVuKhoNguyenLieu.js
 * @description Tầng dịch vụ Client gọi API Quản lý Kho Thực phẩm & Nhà cung cấp.
 * @module services/dichVuKhoNguyenLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import clientAxios from './cauHinhAxiosApi.js';

export const dichVuKhoNguyenLieu = {
  /** Lấy danh sách nguyên liệu tồn kho */
  layDanhSachNguyenLieu: (thamSo) => clientAxios.get('/inventory/ingredients', { params: thamSo }),
  /** Thêm nguyên liệu mới vào kho */
  themNguyenLieuMoi: (duLieu) => clientAxios.post('/inventory/ingredients', duLieu),
  /** Cập nhật số lượng tồn kho (nhập thêm hoặc điều chỉnh) */
  capNhatTonKho: (id, soLuong, hanhDong = 'add') => 
    clientAxios.patch(`/inventory/ingredients/${id}/stock`, { amount: soLuong, action: hanhDong }),
  /** Lấy danh sách đối tác nhà cung cấp */
  layDanhSachNhaCungCap: () => clientAxios.get('/inventory/suppliers'),

  // Bí danh tương thích
  getIngredients: (params) => clientAxios.get('/inventory/ingredients', { params }),
  createIngredient: (data) => clientAxios.post('/inventory/ingredients', data),
  updateStock: (id, amount, action = 'add') => clientAxios.patch(`/inventory/ingredients/${id}/stock`, { amount, action }),
  getSuppliers: () => clientAxios.get('/inventory/suppliers')
};

export const inventoryService = dichVuKhoNguyenLieu;

export default dichVuKhoNguyenLieu;
