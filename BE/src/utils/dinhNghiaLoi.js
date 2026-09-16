/**
 * @file dinhNghiaLoi.js
 * @description Định nghĩa cây phân cấp các lớp đối tượng ngoại lệ (Custom Error Classes) kế thừa từ lớp chuẩn Error của JavaScript.
 * Giúp mã nguồn phân loại lỗi rõ ràng, gắn mã trạng thái HTTP Status Code (400, 401, 403, 404, 500) tương ứng
 * và chuẩn hóa thông báo lỗi thân thiện gửi về Client.
 * @module utils/dinhNghiaLoi
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Lớp lỗi cơ sở của toàn bộ ứng dụng
 * @class LoiUngDung
 * @extends Error
 */
export class LoiUngDung extends Error {
  /**
   * @param {string} thongBao - Thông điệp mô tả chi tiết lỗi
   * @param {number} maTrangThai - Mã lỗi HTTP (mặc định 500)
   * @param {any} chiTietLoi - Dữ liệu chi tiết về lỗi nếu có
   */
  constructor(thongBao, maTrangThai = 500, chiTietLoi = null) {
    super(thongBao);
    this.name = this.constructor.name;
    this.statusCode = maTrangThai;
    this.errors = chiTietLoi;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Lỗi dữ liệu yêu cầu không hợp lệ (HTTP 400 Bad Request)
 * @class LoiYeuCauKhongHopLe
 * @extends LoiUngDung
 */
export class LoiYeuCauKhongHopLe extends LoiUngDung {
  constructor(thongBao = 'Dữ liệu yêu cầu không hợp lệ hoặc thiếu trường bắt buộc.', chiTietLoi = null) {
    super(thongBao, 400, chiTietLoi);
  }
}

/**
 * Lỗi chưa xác thực danh tính (HTTP 401 Unauthorized)
 * @class LoiChuaXacThuc
 * @extends LoiUngDung
 */
export class LoiChuaXacThuc extends LoiUngDung {
  constructor(thongBao = 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.') {
    super(thongBao, 401);
  }
}

/**
 * Lỗi không đủ quyền hạn truy cập (HTTP 403 Forbidden)
 * @class LoiKhongCoQuyen
 * @extends LoiUngDung
 */
export class LoiKhongCoQuyen extends LoiUngDung {
  constructor(thongBao = 'Bạn không có quyền hạn truy cập hoặc thực hiện thao tác này.') {
    super(thongBao, 403);
  }
}

/**
 * Lỗi không tìm thấy tài nguyên yêu cầu (HTTP 404 Not Found)
 * @class LoiKhongTimThay
 * @extends LoiUngDung
 */
export class LoiKhongTimThay extends LoiUngDung {
  constructor(thongBao = 'Không tìm thấy tài nguyên được yêu cầu trên máy chủ.') {
    super(thongBao, 404);
  }
}

// Giữ các bí danh tiếng Anh để duy trì tương thích hoàn hảo
export const AppError = LoiUngDung;
export const BadRequestError = LoiYeuCauKhongHopLe;
export const UnauthorizedError = LoiChuaXacThuc;
export const ForbiddenError = LoiKhongCoQuyen;
export const NotFoundError = LoiKhongTimThay;

export default {
  LoiUngDung,
  LoiYeuCauKhongHopLe,
  LoiChuaXacThuc,
  LoiKhongCoQuyen,
  LoiKhongTimThay,
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};
