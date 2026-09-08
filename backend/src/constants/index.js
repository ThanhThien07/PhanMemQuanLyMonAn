/**
 * Định nghĩa các hằng số vai trò (Roles) và quyền hạn
 */
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'nhan_vien',
  CHEF: 'bep',
  WAITER: 'phuc_vu'
};

/**
 * Định nghĩa trạng thái Bàn ăn
 */
export const TABLE_STATUS = {
  AVAILABLE: 'trong',
  OCCUPIED: 'co_khach',
  RESERVED: 'da_dat'
};

/**
 * Định nghĩa trạng thái Đặt món
 */
export const ORDER_STATUS = {
  PENDING: 'cho_xac_nhan',
  COOKING: 'dang_che_bien',
  SERVED: 'da_phuc_vu',
  COMPLETED: 'hoan_thanh',
  CANCELLED: 'da_huy'
};

/**
 * Định nghĩa phương thức thanh toán
 */
export const PAYMENT_METHODS = {
  CASH: 'tien_mat',
  TRANSFER: 'chuyen_khoan',
  CARD: 'the',
  UNPAID: 'chua_thanh_toan'
};

/**
 * Định nghĩa trạng thái đặt bàn trước
 */
export const RESERVATION_STATUS = {
  CONFIRMED: 'da_xac_nhan',
  ARRIVED: 'da_den',
  CANCELLED: 'da_huy'
};

export default {
  ROLES,
  TABLE_STATUS,
  ORDER_STATUS,
  PAYMENT_METHODS,
  RESERVATION_STATUS
};
