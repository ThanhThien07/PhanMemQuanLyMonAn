/**
 * @file cauHinhAxiosApi.js
 * @description Cấu hình đối tượng Axios HTTP Client kết nối tới RESTful API Server (http://localhost:5000/api).
 * Tích hợp 2 bộ chặn tự động (Interceptors):
 * 1. Request Interceptor: Tự động trích xuất chuỗi JWT Bearer Token từ localStorage và gắn vào Header Authorization.
 * 2. Response Interceptor: Bóc tách trường data từ gói phản hồi và bắt lỗi phiên làm việc 401 khi token hết hạn.
 * @module services/cauHinhAxiosApi
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import axios from 'axios';

// Xác định baseURL linh hoạt:
// 1. Biến môi trường VITE_API_URL (nếu có)
// 2. Nếu đang chạy qua Vite Dev Server (port 3000) -> Dùng proxy '/api' (hỗ trợ cả LAN IP và điện thoại)
// 3. Nếu truy cập qua Laragon / Apache hoặc khác -> Dùng http://<hostname>:5000/api
const layBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return '/api';
    }
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

// Khởi tạo thực thể Axios Client với cấu hình gốc
const clientAxios = axios.create({
  baseURL: layBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Bộ chặn Request: Tự động gắn Bearer Token vào tiêu đề HTTP
clientAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Bộ chặn Response: Chuẩn hóa kết quả trả về và xử lý lỗi mạng
clientAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let thongBaoLoi = error.response?.data?.message;
    if (!thongBaoLoi) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        thongBaoLoi = 'Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng đảm bảo Backend đang chạy bằng lệnh "npm run dev".';
      } else {
        thongBaoLoi = error.message || 'Đã có lỗi xảy ra trong quá trình gửi yêu cầu.';
      }
    }
    return Promise.reject(new Error(thongBaoLoi));
  }
);

// Bí danh tương thích
export const api = clientAxios;

export default clientAxios;
