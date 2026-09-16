/**
 * @file ghiNhatKyLog.js
 * @description Bộ công cụ ghi nhật ký (Logger Utility) hiển thị màu sắc trực quan trên cửa sổ Terminal.
 * Hỗ trợ các cấp độ log tiêu chuẩn: INFO, SUCCESS, WARN, ERROR, DEBUG và HTTP access log kèm đo lường thời gian (ms).
 * Tự động gắn mốc thời gian (Timestamp) chuẩn ISO để tiện tra cứu và giám sát hệ thống.
 * @module utils/ghiNhatKyLog
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

// Bảng mã màu ANSI phục vụ in log màu sắc trên Terminal / Console
const BANG_MAU = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Lấy chuỗi mốc thời gian hiện tại định dạng YYYY-MM-DD HH:mm:ss
 * @returns {string}
 */
function layThoiGian() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Đối tượng Logger chính của hệ thống
 */
export const ghiLog = {
  /**
   * Ghi log thông tin tổng quan
   */
  info: (thongDiep, ...thamSo) => {
    console.log(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.cyan}ℹ️ [THÔNG TIN]${BANG_MAU.reset}: ${thongDiep}`, ...thamSo);
  },

  /**
   * Ghi log thao tác thực hiện thành công
   */
  success: (thongDiep, ...thamSo) => {
    console.log(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.green}✅ [THÀNH CÔNG]${BANG_MAU.reset}: ${thongDiep}`, ...thamSo);
  },

  /**
   * Ghi log cảnh báo rủi ro nghiệp vụ
   */
  warn: (thongDiep, ...thamSo) => {
    console.warn(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.yellow}⚠️ [CẢNH BÁO]${BANG_MAU.reset}: ${thongDiep}`, ...thamSo);
  },

  /**
   * Ghi log lỗi hệ thống hoặc ngoại lệ phát sinh
   */
  error: (thongDiep, ...thamSo) => {
    console.error(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.red}❌ [LỖI]${BANG_MAU.reset}: ${thongDiep}`, ...thamSo);
  },

  /**
   * Ghi log gỡ lỗi (chỉ kích hoạt ở môi trường phát triển development)
   */
  debug: (thongDiep, ...thamSo) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.magenta}🐛 [GỠ LỖI]${BANG_MAU.reset}: ${thongDiep}`, ...thamSo);
    }
  },

  /**
   * Ghi log vết truy cập mạng HTTP
   * @param {string} phuongThuc - GET, POST, PUT, DELETE...
   * @param {string} duongDan - Đường dẫn URL được gọi
   * @param {number} maTrangThai - HTTP Status Code (200, 400, 500...)
   * @param {number} thoiGianXuLy - Thời gian phản hồi tính bằng mili-giây
   */
  http: (phuongThuc, duongDan, maTrangThai, thoiGianXuLy) => {
    const mauTrangThai = maTrangThai >= 500 ? BANG_MAU.red : maTrangThai >= 400 ? BANG_MAU.yellow : BANG_MAU.green;
    console.log(`${BANG_MAU.dim}[${layThoiGian()}]${BANG_MAU.reset} ${BANG_MAU.blue}[HTTP]${BANG_MAU.reset} ${BANG_MAU.bright}${phuongThuc}${BANG_MAU.reset} ${duongDan} ${mauTrangThai}${maTrangThai}${BANG_MAU.reset} ${BANG_MAU.dim}(${thoiGianXuLy}ms)${BANG_MAU.reset}`);
  }
};

// Bí danh tương thích
export const logger = ghiLog;

export default ghiLog;
