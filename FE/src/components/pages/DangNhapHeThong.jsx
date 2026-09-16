/**
 * @file DangNhapHeThong.jsx
 * @description Màn hình Đăng nhập hệ thống Quản lý Nhà hàng Royal Bistro POS.
 * Cung cấp:
 * 1. Form đăng nhập tiêu chuẩn bằng Email và Mật khẩu.
 * 2. Tính năng 1-Click Demo Login cho 3 vai trò: Admin (Quản lý), Thu Ngân, Bếp Trưởng.
 * 3. Lối tắt chuyển nhanh sang chế độ Khách quét mã QR tự gọi món tại bàn (?table=1).
 * @module pages/DangNhapHeThong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import { useAuth } from '../context/NguoiDungContext.jsx';
import { Flame } from 'lucide-react';

export default function DangNhapHeThong() {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  /**
   * Xử lý gửi form đăng nhập
   */
  const xuLyDangNhap = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      await login(email, password);
    } catch (err) {
      setThongBaoLoi(err.message || 'Đăng nhập không thành công.');
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Xử lý đăng nhập nhanh 1-Click cho tài khoản mẫu
   */
  const xuLyDangNhapNhanh = async (demoEmail) => {
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      await quickLoginAs(demoEmail);
    } catch (err) {
      setThongBaoLoi(err.message);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 d-flex align-items-center justify-content-center p-3 relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Khối Thương Hiệu */}
            <div className="text-center mb-4">
              <div className="inline-flex w-16 h-16 rounded-3 bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] items-center justify-center shadow-lg shadow-blue-500/20 mb-3 transform hover:scale-105 transition-all">
                <Flame className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider uppercase bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">
                ROYAL BISTRO POS
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Hệ Thống Quản Lý Nhà Hàng & Đặt Món Thông Minh
              </p>
            </div>

            {/* Khung Form Đăng Nhập dạng Card Bootstrap kết hợp Tailwind */}
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
              <div className="card-body p-4 p-sm-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="card-title text-base sm:text-lg font-extrabold text-slate-900 mb-0">
                    Đăng Nhập Hệ Thống
                  </h3>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 text-xs">
                    <i className="bi bi-shield-check me-1"></i>Bảo Mật
                  </span>
                </div>

                {thongBaoLoi && (
                  <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 text-xs font-bold mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0 fs-6"></i>
                    <div>{thongBaoLoi}</div>
                  </div>
                )}

                <form onSubmit={xuLyDangNhap} className="space-y-3">
                  <div className="mb-3">
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Đăng Nhập
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@nhahang.com"
                        required
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2.5"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Mật Khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2.5"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={dangXuLy}
                    className="btn btn-primary w-100 py-3 rounded-3 text-white font-black text-sm d-flex align-items-center justify-content-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    {dangXuLy ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng Nhập</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>

                {/* Khối Đăng nhập nhanh 1-Click phục vụ kiểm thử */}
                <div className="mt-4 pt-4 border-top border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    ⚡ Đăng Nhập Nhanh 1-Click (Demo)
                  </div>
                  <div className="row g-2">
                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => xuLyDangNhapNhanh('admin@nhahang.com')}
                        className="btn btn-outline-danger w-100 py-2 rounded-3 d-flex flex-column align-items-center gap-1 text-xs"
                      >
                        <i className="bi bi-shield-lock-fill fs-5"></i>
                        <span className="fw-bold">Admin</span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => xuLyDangNhapNhanh('thungan@nhahang.com')}
                        className="btn btn-outline-success w-100 py-2 rounded-3 d-flex flex-column align-items-center gap-1 text-xs"
                      >
                        <i className="bi bi-cash-coin fs-5"></i>
                        <span className="fw-bold">Thu Ngân</span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => xuLyDangNhapNhanh('bep@nhahang.com')}
                        className="btn btn-outline-warning w-100 py-2 rounded-3 d-flex flex-column align-items-center gap-1 text-xs"
                      >
                        <i className="bi bi-fire fs-5"></i>
                        <span className="fw-bold">Bếp Trưởng</span>
                      </button>
                    </div>
                  </div>

                  {/* Nút dành cho khách quét mã đặt món */}
                  <div className="mt-3 pt-3 border-top border-slate-100">
                    <a
                      href="/?table=1"
                      className="btn btn-warning w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 text-white font-bold text-xs shadow-sm"
                    >
                      <i className="bi bi-qr-code-scan"></i>
                      <span>📱 Khách Ăn Tại Bàn? Quét Mã / Đặt Món Ngay</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4 text-xs font-semibold text-slate-400">
              Royal Bistro POS • Professional Restaurant Management System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const Login = DangNhapHeThong;
