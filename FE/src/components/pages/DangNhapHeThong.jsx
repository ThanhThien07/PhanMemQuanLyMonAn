/**
 * @file DangNhapHeThong.jsx
 * @description Màn hình Đăng Nhập & Đăng Ký hệ thống Nhà hàng Royal Bistro POS.
 * Tính năng chính:
 * 1. Chuyển đổi linh hoạt giữa 2 Tab: "Đăng Nhập" và "Đăng Ký Tài Khoản".
 * 2. Đăng ký tài khoản Khách hàng thân thiết (tự động tạo hồ sơ CRM tích điểm) hoặc Nhân viên.
 * 3. Đăng nhập tiêu chuẩn bằng Email và Mật khẩu.
 * 4. Đăng nhập nhanh 1-Click Demo cho 4 vai trò: Admin (Quản lý), Thu Ngân, Bếp Trưởng, Phục Vụ.
 * 5. Lối tắt quét mã QR gọi món tại bàn (?table=1).
 * @module pages/DangNhapHeThong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import { useAuth } from '../context/NguoiDungContext.jsx';
import { useToast } from '../context/ThongBaoToastContext.jsx';
import { 
  Flame, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';

export default function DangNhapHeThong() {
  const { login, register, quickLoginAs } = useAuth();
  const toast = useToast();

  // Tab hiện tại: 'login' hoặc 'register'
  const [tabHienTai, setTabHienTai] = useState('login');

  // Form Đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Form Đăng ký
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('khach_hang');

  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  /**
   * Xử lý gửi form Đăng nhập
   */
  const xuLyDangNhap = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      await login(email, password);
      toast.thanhCong('Đăng nhập thành công! Chào mừng trở lại.', 'Xác Thực');
    } catch (err) {
      const msg = err.message || 'Đăng nhập không thành công.';
      setThongBaoLoi(msg);
      toast.loi(msg, 'Đăng Nhập Thất Bại');
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Xử lý gửi form Đăng ký tài khoản
   */
  const xuLyDangKy = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');

    if (regPassword !== regConfirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp!';
      setThongBaoLoi(msg);
      toast.loi(msg, 'Đăng Ký');
      return;
    }

    if (regPassword.length < 6) {
      const msg = 'Mật khẩu phải có ít nhất 6 ký tự!';
      setThongBaoLoi(msg);
      toast.loi(msg, 'Đăng Ký');
      return;
    }

    setDangXuLy(true);
    try {
      await register(regName, regEmail, regPassword, regPhone, regRole);
      toast.thanhCong('🎉 Đăng ký tài khoản thành công! Đã tự động đăng nhập vào hệ thống.', 'Thành Công');
    } catch (err) {
      const msg = err.message || 'Đăng ký không thành công.';
      setThongBaoLoi(msg);
      toast.loi(msg, 'Lỗi Đăng Ký');
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
      toast.thanhCong('Đăng nhập nhanh thành công!', 'Demo Login');
    } catch (err) {
      setThongBaoLoi(err.message);
      toast.loi(err.message, 'Lỗi Đăng Nhập');
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
            <div className="text-center mb-3">
              <div className="inline-flex w-14 h-14 rounded-3 bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] items-center justify-center shadow-lg shadow-blue-500/20 mb-2.5 transform hover:scale-105 transition-all">
                <Flame className="w-7 h-7 text-white fill-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">
                ROYAL BISTRO POS
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Quản Lý Nhà Hàng & Đặt Món Khách Hàng Thông Minh
              </p>
            </div>

            {/* Khung Form Card Bootstrap */}
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
              {/* Tab chuyển đổi Đăng Nhập <-> Đăng Ký */}
              <div className="d-flex border-bottom border-slate-200 bg-slate-50/70 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTabHienTai('login');
                    setThongBaoLoi('');
                  }}
                  className={`btn flex-1 py-2 rounded-3 text-xs font-black d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                    tabHienTai === 'login'
                      ? 'btn-white bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border-0'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-[#0077B6]" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTabHienTai('register');
                    setThongBaoLoi('');
                  }}
                  className={`btn flex-1 py-2 rounded-3 text-xs font-black d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                    tabHienTai === 'register'
                      ? 'btn-white bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border-0'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Đăng Ký Mới</span>
                </button>
              </div>

              <div className="card-body p-4 p-sm-5 pt-4">
                {thongBaoLoi && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-xs font-bold mb-3">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                    <div>{thongBaoLoi}</div>
                  </div>
                )}

                {/* FORM ĐĂNG NHẬP */}
                {tabHienTai === 'login' && (
                  <>
                    <form onSubmit={xuLyDangNhap} className="space-y-3">
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Email Đăng Nhập
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@nhahang.com hoặc email của bạn"
                            required
                            className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Mật Khẩu
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={dangXuLy}
                        className="btn btn-primary w-100 py-2.5 rounded-3 text-white font-black text-sm d-flex align-items-center justify-content-center gap-2 shadow-md transition-all mt-2"
                      >
                        {dangXuLy ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Đang xác thực...</span>
                          </>
                        ) : (
                          <>
                            <span>Đăng Nhập Vào Hệ Thống</span>
                            <i className="bi bi-arrow-right"></i>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Khối Đăng nhập nhanh 1-Click phục vụ kiểm thử đồ án */}
                    <div className="mt-4 pt-3 border-top border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                        ⚡ Đăng Nhập Nhanh 1-Click Demo
                      </div>
                      <div className="row g-2">
                        <div className="col-3">
                          <button
                            type="button"
                            onClick={() => xuLyDangNhapNhanh('admin@nhahang.com')}
                            className="btn btn-outline-danger w-100 py-1.5 rounded-3 d-flex flex-column align-items-center gap-0.5 text-xs"
                            title="Quản lý Admin"
                          >
                            <i className="bi bi-shield-lock-fill fs-6"></i>
                            <span className="fw-bold text-[11px]">Admin</span>
                          </button>
                        </div>

                        <div className="col-3">
                          <button
                            type="button"
                            onClick={() => xuLyDangNhapNhanh('thungan@nhahang.com')}
                            className="btn btn-outline-success w-100 py-1.5 rounded-3 d-flex flex-column align-items-center gap-0.5 text-xs"
                            title="Thu Ngân"
                          >
                            <i className="bi bi-cash-coin fs-6"></i>
                            <span className="fw-bold text-[11px]">Thu Ngân</span>
                          </button>
                        </div>

                        <div className="col-3">
                          <button
                            type="button"
                            onClick={() => xuLyDangNhapNhanh('bep@nhahang.com')}
                            className="btn btn-outline-warning w-100 py-1.5 rounded-3 d-flex flex-column align-items-center gap-0.5 text-xs"
                            title="Bếp Trưởng"
                          >
                            <i className="bi bi-fire fs-6"></i>
                            <span className="fw-bold text-[11px]">Bếp</span>
                          </button>
                        </div>

                        <div className="col-3">
                          <button
                            type="button"
                            onClick={() => xuLyDangNhapNhanh('phucvu@nhahang.com')}
                            className="btn btn-outline-primary w-100 py-1.5 rounded-3 d-flex flex-column align-items-center gap-0.5 text-xs"
                            title="Phục Vụ"
                          >
                            <i className="bi bi-person-badge fs-6"></i>
                            <span className="fw-bold text-[11px]">Phục Vụ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* FORM ĐĂNG KÝ TÀI KHOẢN MỚI */}
                {tabHienTai === 'register' && (
                  <form onSubmit={xuLyDangKy} className="space-y-3">
                    <div>
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Họ và Tên
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn Khách"
                          required
                          className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Số Điện Thoại (Tích Điểm CRM)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0912345678"
                          className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Email Đăng Nhập
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="khachhang@email.com"
                          required
                          className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Mật Khẩu
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Xác Nhận
                        </label>
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Loại Tài Khoản
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="form-select bg-slate-50 border-slate-200 text-xs font-bold py-2"
                      >
                        <option value="khach_hang">Khách Hàng Thân Thiết (Tích Điểm & Ưu Đãi)</option>
                        <option value="nhan_vien">Nhân Viên Phục Vụ / Thu Ngân</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={dangXuLy}
                      className="btn btn-success w-100 py-2.5 rounded-3 text-white font-black text-sm d-flex align-items-center justify-content-center gap-2 shadow-md transition-all mt-3"
                    >
                      {dangXuLy ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Đang đăng ký...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Tạo Tài Khoản Mới</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Nút dành cho khách ăn tại bàn muốn gọi món ngay */}
                <div className="mt-3 pt-3 border-top border-slate-100">
                  <a
                    href="?table=1"
                    className="btn btn-warning w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 text-white font-bold text-xs shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>📱 Khách Quét Mã QR Gọi Món Tại Bàn</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-xs font-semibold text-slate-400">
              Royal Bistro Restaurant POS • Chuyên Đề Fullstack Node.js & React
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const Login = DangNhapHeThong;
