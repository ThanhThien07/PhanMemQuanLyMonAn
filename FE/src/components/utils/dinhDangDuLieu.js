/**
 * @file dinhDangDuLieu.js
 * @description Tiện ích chuẩn hóa và định dạng dữ liệu hiển thị trên giao diện người dùng:
 * 1. dinhDangTienTe (formatCurrency): Chuyển đổi số tiền thành chuỗi tiền tệ VNĐ có phân cách hàng nghìn (ví dụ: 450.000 đ).
 * 2. dinhDangNgayGio (formatDateTime): Định dạng ngày giờ Việt Nam (hh:mm dd/mm/yyyy).
 * 3. dinhDangNgay (formatDate): Định dạng ngày tháng năm (dd/mm/yyyy).
 * 4. dinhDangGio (formatTime): Định dạng giờ phút (hh:mm).
 * @module utils/dinhDangDuLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Định dạng số tiền sang chuỗi tiền tệ Việt Nam (VNĐ)
 * @function dinhDangTienTe
 * @param {number|string} soTien - Giá trị số tiền cần định dạng
 * @returns {string} Chuỗi tiền tệ (ví dụ: "450.000 đ")
 */
export function dinhDangTienTe(soTien) {
  if (soTien === undefined || soTien === null || isNaN(soTien)) return '0 đ';
  return `${Number(soTien).toLocaleString('vi-VN')} đ`;
}

/**
 * Định dạng chuỗi ngày giờ đầy đủ (hh:mm dd/mm/yyyy)
 * @function dinhDangNgayGio
 * @param {string|Date} chuoiNgay - Chuỗi hoặc đối tượng Date
 * @returns {string}
 */
export function dinhDangNgayGio(chuoiNgay) {
  if (!chuoiNgay) return '—';
  try {
    return new Date(chuoiNgay).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return String(chuoiNgay);
  }
}

/**
 * Định dạng ngày tháng năm (dd/mm/yyyy)
 * @function dinhDangNgay
 * @param {string|Date} chuoiNgay - Chuỗi hoặc đối tượng Date
 * @returns {string}
 */
export function dinhDangNgay(chuoiNgay) {
  if (!chuoiNgay) return '—';
  try {
    return new Date(chuoiNgay).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return String(chuoiNgay);
  }
}

/**
 * Định dạng giờ phút (hh:mm)
 * @function dinhDangGio
 * @param {string|Date} chuoiNgay - Chuỗi hoặc đối tượng Date
 * @returns {string}
 */
export function dinhDangGio(chuoiNgay) {
  if (!chuoiNgay) return '—';
  try {
    return new Date(chuoiNgay).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(chuoiNgay);
  }
}

// Bí danh tương thích
export const formatCurrency = dinhDangTienTe;
export const formatDateTime = dinhDangNgayGio;
export const formatDate = dinhDangNgay;
export const formatTime = dinhDangGio;

export default {
  dinhDangTienTe,
  dinhDangNgayGio,
  dinhDangNgay,
  dinhDangGio,
  formatCurrency,
  formatDateTime,
  formatDate,
  formatTime
};
