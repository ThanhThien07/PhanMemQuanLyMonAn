/**
 * Bọc các hàm async controller để tự động bắt lỗi và chuyển tới middleware errorHandler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
