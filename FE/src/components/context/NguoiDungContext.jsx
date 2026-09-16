/**
 * @file NguoiDungContext.jsx
 * @description React Context quản lý trạng thái phiên đăng nhập của người dùng (Authentication Context).
 * Lưu trữ thông tin tài khoản (user), token JWT, tự động tải lại phiên làm việc từ localStorage
 * và cung cấp các hàm đăng nhập (dangNhap), đăng nhập nhanh demo (dangNhapNhanh) và đăng xuất (dangXuat).
 * @module context/NguoiDungContext
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import clientAxios from '../services/cauHinhAxiosApi.js';

const NguoiDungContext = createContext(null);

export function BoCungCapNguoiDung({ children }) {
  const [nguoiDung, setNguoiDung] = useState(() => {
    try {
      const duLieuLuu = localStorage.getItem('user');
      return duLieuLuu ? JSON.parse(duLieuLuu) : null;
    } catch {
      return null;
    }
  });
  const [dangTai, setDangTai] = useState(true);

  // Tự động kiểm tra tính hợp lệ của token khi mở website
  useEffect(() => {
    const chuoiToken = localStorage.getItem('token');
    if (chuoiToken) {
      clientAxios.get('/auth/me')
        .then((phanHoi) => {
          if (phanHoi.success) {
            setNguoiDung(phanHoi.user);
            localStorage.setItem('user', JSON.stringify(phanHoi.user));
          }
        })
        .catch(() => {
          dangXuat();
        })
        .finally(() => setDangTai(false));
    } else {
      setDangTai(false);
    }
  }, []);

  /**
   * Xử lý đăng nhập thông thường bằng email và mật khẩu
   */
  const dangNhap = async (email, matKhau) => {
    const phanHoi = await clientAxios.post('/auth/login', { email, password: matKhau });
    if (phanHoi.success) {
      localStorage.setItem('token', phanHoi.token);
      localStorage.setItem('user', JSON.stringify(phanHoi.user));
      setNguoiDung(phanHoi.user);
    }
    return phanHoi;
  };

  /**
   * Đăng nhập nhanh 1-Click phục vụ kiểm thử đồ án
   */
  const dangNhapNhanh = async (email) => {
    return dangNhap(email, '123456');
  };

  /**
   * Đăng xuất xóa sạch phiên lưu trữ
   */
  const dangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNguoiDung(null);
  };

  return (
    <NguoiDungContext.Provider
      value={{
        nguoiDung,
        dangTai,
        dangNhap,
        dangNhapNhanh,
        dangXuat,
        // Bí danh tương thích
        user: nguoiDung,
        loading: dangTai,
        login: dangNhap,
        quickLoginAs: dangNhapNhanh,
        logout: dangXuat
      }}
    >
      {children}
    </NguoiDungContext.Provider>
  );
}

/**
 * Hook tùy biến sử dụng NguoiDungContext
 */
export function suDungNguoiDung() {
  const nguoiDungCtx = useContext(NguoiDungContext);
  if (!nguoiDungCtx) throw new Error('suDungNguoiDung phải được dùng bên trong BoCungCapNguoiDung');
  return nguoiDungCtx;
}

// Bí danh tương thích
export const AuthProvider = BoCungCapNguoiDung;
export const NguoiDungProvider = BoCungCapNguoiDung;
export const useAuth = suDungNguoiDung;
export const useNguoiDung = suDungNguoiDung;

export default NguoiDungContext;
