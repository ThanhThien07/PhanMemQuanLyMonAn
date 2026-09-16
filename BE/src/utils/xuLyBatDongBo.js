/**
 * @file xuLyBatDongBo.js
 * @description Hàm tiện ích bao bọc (wrapper) các hàm Controller bất đồng bộ (async).
 * Giúp tự động bắt ngoại lệ phát sinh (Catch Error) và chuyển tiếp tới Middleware xử lý lỗi tập trung,
 * triệt tiêu hoàn toàn sự lặp lại của các khối try/catch trong tầng Controller.
 * @module utils/xuLyBatDongBo
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

/**
 * Bao bọc một hàm Controller bất đồng bộ để bắt lỗi tự động
 * @function xuLyBatDongBo
 * @param {Function} hamXuLy - Hàm middleware hoặc controller dạng async (req, res, next)
 * @returns {Function} Hàm middleware chuẩn của Express
 */
export const xuLyBatDongBo = (hamXuLy) => (req, res, next) => {
  Promise.resolve(hamXuLy(req, res, next)).catch(next);
};

// Bí danh tương thích
export const asyncHandler = xuLyBatDongBo;

export default xuLyBatDongBo;
