/**
 * @file debounce.js
 * @description Hàm tiện ích Debounce & Throttle tối ưu hóa sự kiện nhập liệu và cuộn trang
 * Dựa trên giáo trình Chương 8: Tối ưu hoá và SEO (Slide 16)
 * Giảm tải JavaScript chạy trên Main Thread, cải thiện chỉ số INP <= 200ms
 */

/**
 * Tạo một hàm debounce để chỉ thực thi sau khi người dùng ngừng kích hoạt sự kiện trong khoảng thời gian chờ
 * @param {Function} fn Hàm cần thực thi
 * @param {number} delay Thời gian chờ (mặc định 300ms)
 * @returns {Function} Hàm đã được bọc debounce
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Tạo một hàm throttle giới hạn tần suất thực thi tối đa 1 lần trong mỗi chu kỳ thời gian
 * @param {Function} fn Hàm cần thực thi
 * @param {number} limit Khoảng thời gian giới hạn (mặc định 200ms)
 * @returns {Function}
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
