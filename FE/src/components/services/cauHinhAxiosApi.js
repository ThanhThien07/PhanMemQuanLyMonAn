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

// Khởi tạo thực thể Axios Client với cấu hình gốc
const clientAxios = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
    const thongBaoLoi = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra trong quá trình gửi yêu cầu.';
    return Promise.reject(new Error(thongBaoLoi));
  }
);

// Bí danh tương thích
export const api = clientAxios;

export default clientAxios;
