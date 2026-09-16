/**
 * @file chuanHoaPhanHoi.js
 * @description Chuẩn hóa định dạng gói dữ liệu JSON trả về cho Client (Format Response Pattern).
 * Đảm bảo mọi phản hồi từ RESTful API đều có cấu trúc nhất quán gồm:
 * { success: Boolean, statusCode: Number, message: String, data: Object|Array, errors: Any }
 * Giúp Frontend dễ dàng bắt lỗi và bóc tách dữ liệu mà không bị lỗi undefined.
 * @module utils/chuanHoaPhanHoi
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Trả về phản hồi JSON thành công
 * @function phanHoiThanhCong
 * @param {Object} res - Đối tượng Response của Express
 * @param {any} duLieu - Dữ liệu kết quả cần gửi về Client (mặc định null)
 * @param {string} thongBao - Thông điệp thông báo kết quả (mặc định 'Thành công')
 * @param {number} maTrangThai - Mã HTTP Status Code (mặc định 200 OK)
 * @returns {Object} JSON Response
 */
export function phanHoiThanhCong(res, duLieu = null, thongBao = 'Thành công', maTrangThai = 200) {
  return res.status(maTrangThai).json({
    success: true,
    statusCode: maTrangThai,
    message: thongBao,
    data: duLieu !== null ? duLieu : undefined,
    ...(typeof duLieu === 'object' && !Array.isArray(duLieu) && duLieu !== null ? duLieu : {})
  });
}

/**
 * Trả về phản hồi JSON báo lỗi
 * @function phanHoiLoi
 * @param {Object} res - Đối tượng Response của Express
 * @param {string} thongBao - Thông điệp mô tả lỗi
 * @param {number} maTrangThai - Mã HTTP Status Code lỗi (mặc định 500)
 * @param {any} chiTietLoi - Chi tiết hoặc danh sách lỗi validation nếu có
 * @returns {Object} JSON Response
 */
export function phanHoiLoi(res, thongBao = 'Đã có lỗi xảy ra trong quá trình xử lý', maTrangThai = 500, chiTietLoi = null) {
  return res.status(maTrangThai).json({
    success: false,
    statusCode: maTrangThai,
    message: thongBao,
    errors: chiTietLoi || undefined
  });
}

// Giữ các bí danh tiếng Anh để duy trì tương thích
export const successResponse = phanHoiThanhCong;
export const errorResponse = phanHoiLoi;

export default {
  phanHoiThanhCong,
  phanHoiLoi,
  successResponse,
  errorResponse
};
