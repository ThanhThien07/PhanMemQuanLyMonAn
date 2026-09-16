/**
 * @file taoMaTuTang.js
 * @description Tiện ích chuẩn hóa bộ lọc tìm kiếm ID (Filter Helper) cho cơ sở dữ liệu MongoDB Mongoose.
 * Cho phép tìm kiếm tài nguyên linh hoạt theo cả hai định dạng:
 * 1. Mã số nguyên tự tăng tuần tự (ví dụ: id = 1, 2, 3...)
 * 2. Mã ObjectId 24 ký tự Hexadecimal mặc định của MongoDB (ví dụ: _id = "65f1a2b3c4d5e6f7a8b9c0d1")
 * Giúp ngăn ngừa tuyệt đối lỗi ngoại lệ CastError (Cast to ObjectId failed).
 * @module utils/taoMaTuTang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Chuyển đổi giá trị đầu vào thành object filter an toàn cho truy vấn findOne / findById
 * @function chuyenDoiBoLocId
 * @param {string|number|null|undefined} giaTriId - Giá trị ID nhận từ req.params hoặc req.body
 * @returns {Object} Đối tượng truy vấn MongoDB ({ id: Number } hoặc { _id: String })
 */
export function chuyenDoiBoLocId(giaTriId) {
  if (giaTriId === undefined || giaTriId === null) {
    return { _id: null };
  }
  const chuoiId = String(giaTriId).trim();
  
  // Kiểm tra nếu là chuỗi ObjectId 24 ký tự hex của MongoDB
  if (/^[0-9a-fA-F]{24}$/.test(chuoiId)) {
    return { _id: chuoiId };
  }
  
  // Nếu là số nguyên định danh tuần tự
  const soNguyen = Number(chuoiId);
  if (!isNaN(soNguyen)) {
    return { id: soNguyen };
  }
  
  return { _id: null };
}

// Bí danh tương thích cho hệ thống cũ
export const toIdFilter = chuyenDoiBoLocId;

export default chuyenDoiBoLocId;
