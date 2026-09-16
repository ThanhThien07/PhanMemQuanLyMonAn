/**
 * @file hangSoHeThong.js
 * @description Định nghĩa tập trung các hằng số quy chuẩn nghiệp vụ trong toàn bộ hệ thống quản lý nhà hàng:
 * Vai trò phân quyền (VAI_TRO), Trạng thái bàn ăn (TRANG_THAI_BAN), Trạng thái đơn gọi món (TRANG_THAI_DAT_MON),
 * Phương thức thanh toán (PHUONG_THUC_THANH_TOAN) và Trạng thái đặt bàn trước (TRANG_THAI_DAT_BAN).
 * @module constants/hangSoHeThong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Các vai trò người dùng trong hệ thống (RBAC)
 */
export const VAI_TRO = {
  ADMIN: 'admin',          // Quản trị viên tối cao: toàn quyền hệ thống, xem báo cáo, quản lý món & kho
  NHAN_VIEN: 'nhan_vien',  // Nhân viên phục vụ / bán hàng tại sảnh
  BEP: 'bep',              // Đầu bếp / Bếp trưởng: quản lý KDS và đổi trạng thái chế biến
  THU_NGAN: 'thu_ngan',    // Thu ngân: xem hóa đơn, in phiếu và xác nhận thanh toán
  PHUC_VU: 'phuc_vu'       // Nhân viên chạy bàn
};

/**
 * Các trạng thái vận hành của Bàn ăn
 */
export const TRANG_THAI_BAN = {
  TRONG: 'trong',          // Bàn còn trống, sẵn sàng đón khách mới
  CO_KHACH: 'co_khach',    // Bàn đang có khách ngồi dùng bữa và đang phục vụ
  DA_DAT: 'da_dat'         // Bàn đã có khách hẹn đặt trước theo khung giờ
};

/**
 * Các trạng thái vòng đời của một Đơn gọi món (Order Lifecycle)
 */
export const TRANG_THAI_DAT_MON = {
  CHO_XAC_NHAN: 'cho_xac_nhan',   // Khách hoặc nhân viên vừa gửi order, chờ bếp nhận
  DANG_CHE_BIEN: 'dang_che_bien', // Bếp đã bấm nhận đơn và đang thực hiện nấu
  DA_PHUC_VU: 'da_phuc_vu',       // Món ăn đã được chế biến xong và bưng ra bàn
  HOAN_THANH: 'hoan_thanh',       // Đơn gọi món đã thanh toán hóa đơn hoàn tất
  DA_HUY: 'da_huy'                // Đơn gọi món bị hủy (hết nguyên liệu hoặc khách đổi ý)
};

/**
 * Các phương thức thanh toán hóa đơn được hỗ trợ
 */
export const PHUONG_THUC_THANH_TOAN = {
  TIEN_MAT: 'tien_mat',             // Thanh toán bằng tiền mặt trực tiếp tại quầy
  CHUYEN_KHOAN: 'chuyen_khoan',     // Thanh toán chuyển khoản tự động qua mã VietQR Napas247
  THE: 'the',                       // Thanh toán thẻ POS ngân hàng
  CHUA_THANH_TOAN: 'chua_thanh_toan'// Đơn chưa được thanh toán
};

/**
 * Các trạng thái phiếu Đặt bàn trước (Reservations)
 */
export const TRANG_THAI_DAT_BAN = {
  DA_XAC_NHAN: 'da_xac_nhan', // Phiếu đặt bàn đã được tiếp nhận và giữ chỗ
  DA_DEN: 'da_den',           // Khách hàng đã có mặt tại nhà hàng và check-in vào bàn
  DA_HUY: 'da_huy'            // Khách hủy hẹn đặt bàn hoặc quá giờ quy định
};

// Xuất các bí danh tiếng Anh để giữ tính tương thích hoàn hảo
export const ROLES = VAI_TRO;
export const TABLE_STATUS = TRANG_THAI_BAN;
export const ORDER_STATUS = TRANG_THAI_DAT_MON;
export const PAYMENT_METHODS = PHUONG_THUC_THANH_TOAN;
export const RESERVATION_STATUS = TRANG_THAI_DAT_BAN;

export default {
  VAI_TRO,
  TRANG_THAI_BAN,
  TRANG_THAI_DAT_MON,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_DAT_BAN,
  ROLES,
  TABLE_STATUS,
  ORDER_STATUS,
  PAYMENT_METHODS,
  RESERVATION_STATUS
};
