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
  const [regErrors, setRegErrors] = useState({});

  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  /**
   * Kiểm tra tính hợp lệ của dữ liệu đăng ký (chống điền linh tinh)
   * @returns {Object} Đối tượng chứa danh sách lỗi
   */
  const kiemTraDuLieuDangKy = () => {
    const loi = {};
    const tenTrim = regName.trim();
    const emailTrim = regEmail.trim();
    const sdtTrim = regPhone.trim();

    // Họ và tên: Chữ cái tiếng Việt và khoảng trắng, 2 - 50 ký tự (không số, không ký tự đặc biệt)
    const regexTen = /^[a-zA-ZÀ-ỹ\s]{2,50}$/u;
    if (!tenTrim) {
      loi.name = 'Vui lòng nhập họ và tên của bạn.';
    } else if (!regexTen.test(tenTrim)) {
      loi.name = 'Họ tên chỉ được gồm chữ cái tiếng Việt, từ 2 đến 50 ký tự (không chứa số hoặc ký tự lạ).';
    }

    // Số điện thoại: Chuẩn di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
    const regexSdt = /^(0[35789])[0-9]{8}$/;
    if (!sdtTrim) {
      loi.phone = 'Vui lòng nhập số điện thoại để tích điểm thành viên CRM.';
    } else if (!regexSdt.test(sdtTrim)) {
      loi.phone = 'Số điện thoại phải gồm 10 chữ số hợp lệ (bắt đầu bằng 03, 05, 07, 08, 09).';
    }

    // Email đăng nhập
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrim) {
      loi.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!regexEmail.test(emailTrim)) {
      loi.email = 'Định dạng email chưa đúng chuẩn (ví dụ: khachhang@email.com).';
    }

    // Mật khẩu
    if (!regPassword) {
      loi.password = 'Vui lòng nhập mật khẩu.';
    } else if (regPassword.length < 6) {
      loi.password = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
    }

    // Xác nhận mật khẩu
    if (!regConfirmPassword) {
      loi.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
    } else if (regPassword !== regConfirmPassword) {
      loi.confirmPassword = 'Mật khẩu xác nhận không trùng khớp!';
    }

    setRegErrors(loi);
    return loi;
  };

  /**
   * Xử lý gửi form Đăng nhập
   */
  const xuLyDangNhap = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      const res = await login(email, password);
      toast.thanhCong('Đăng nhập thành công! Chào mừng trở lại.', 'Xác Thực');
      if (res?.user?.role === 'khach_hang') {
        window.location.href = '/?table=1';
      }
    } catch (err) {
      const msg = err.message || 'Đăng nhập không thành công.';
      setThongBaoLoi(msg);
      toast.loi(msg, 'Đăng Nhập Thất Bại');
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Xử lý gửi form Đăng ký tài khoản Khách Hàng
   */
  const xuLyDangKy = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');

    const cacLoi = kiemTraDuLieuDangKy();
    if (Object.keys(cacLoi).length > 0) {
      const loiDauTien = Object.values(cacLoi)[0];
      setThongBaoLoi(loiDauTien);
      toast.canhBao(loiDauTien, 'Thông Tin Chưa Hợp Lệ');
      return;
    }

    setDangXuLy(true);
    try {
      await register(regName.trim(), regEmail.trim(), regPassword, regPhone.trim(), 'khach_hang');
      toast.thanhCong('🎉 Đăng ký thành công! Đang chuyển vào thực đơn gọi món tại bàn...', 'Thành Công');
      setTimeout(() => {
        window.location.href = '/?table=1';
      }, 300);
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
    <div className="min-h-screen bg-slate-100 d-flex align-items-center justify-content-center p-3 relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Khối Thương Hiệu */}
            <div className="text-center mb-3">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] items-center justify-center shadow-lg shadow-blue-500/20 mb-2.5 transform hover:scale-105 transition-all">
                <Flame className="w-7 h-7 text-white fill-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">
                ROYAL BISTRO POS
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Hệ Thống Nhà Hàng & Đặt Món
              </p>
            </div>

            {/* Khung Form Card Bootstrap Nổi Khối */}
            <div className="card shadow-xl border border-slate-200/90 rounded-3xl overflow-hidden bg-white">
              {/* Tab chuyển đổi Đăng Nhập <-> Đăng Ký */}
              <div className="d-flex border-bottom border-slate-200 bg-slate-50/70 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTabHienTai('login');
                    setThongBaoLoi('');
                  }}
                  className={`btn flex-1 py-2 rounded-pill text-xs font-black d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                    tabHienTai === 'login'
                      ? 'btn-white bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border-0'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTabHienTai('register');
                    setThongBaoLoi('');
                    setRegErrors({});
                  }}
                  className={`btn flex-1 py-2 rounded-pill text-xs font-black d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                    tabHienTai === 'register'
                      ? 'btn-white bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border-0'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Đăng Ký Mới</span>
                </button>
              </div>

              <div className="card-body p-4 p-sm-5 pt-4">
                {thongBaoLoi && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-pill text-xs font-bold mb-3">
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
                        className="btn btn-primary w-100 py-2.5 rounded-pill text-white font-black text-sm d-flex align-items-center justify-content-center gap-2 shadow-md transition-all mt-2 cursor-pointer"
                      >
                        {dangXuLy ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Đang xác thực...</span>
                          </>
                        ) : (
                          <>
                            <span>Đăng Nhập</span>
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
                            className="btn btn-outline-danger w-100 py-1.5 rounded-pill d-flex flex-column align-items-center gap-0.5 text-xs cursor-pointer"
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
                            className="btn btn-outline-primary w-100 py-1.5 rounded-pill d-flex flex-column align-items-center gap-0.5 text-xs cursor-pointer"
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
                            className="btn btn-outline-danger w-100 py-1.5 rounded-pill d-flex flex-column align-items-center gap-0.5 text-xs cursor-pointer"
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
                            className="btn btn-outline-primary w-100 py-1.5 rounded-pill d-flex flex-column align-items-center gap-0.5 text-xs cursor-pointer"
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
                  <form onSubmit={xuLyDangKy} noValidate className="space-y-3">
                    {/* Họ và Tên */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-0">
                          Họ và Tên <span className="text-danger">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Chỉ chữ cái</span>
                      </div>
                      <div className="input-group">
                        <span className={`input-group-text ${regErrors.name ? 'bg-rose-50 border-rose-300 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => {
                            setRegName(e.target.value);
                            if (regErrors.name) setRegErrors((prev) => ({ ...prev, name: '' }));
                          }}
                          placeholder="Ví dụ: Nguyễn Văn Khách"
                          className={`form-control text-slate-900 text-sm py-2 ${
                            regErrors.name ? 'border-rose-300 bg-rose-50/20 is-invalid' : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                      </div>
                      {regErrors.name && (
                        <div className="text-[11px] text-danger font-semibold mt-1 d-flex align-items-center gap-1">
                          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                          <span>{regErrors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Số Điện Thoại */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-0">
                          Số Điện Thoại (Tích Điểm CRM) <span className="text-danger">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">10 số di động VN</span>
                      </div>
                      <div className="input-group">
                        <span className={`input-group-text ${regErrors.phone ? 'bg-rose-50 border-rose-300 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => {
                            // Chỉ cho phép gõ số, tự động loại bỏ chữ và ký tự đặc biệt, tối đa 10 số
                            const chiSo = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setRegPhone(chiSo);
                            if (regErrors.phone) setRegErrors((prev) => ({ ...prev, phone: '' }));
                          }}
                          placeholder="0912345678"
                          className={`form-control text-slate-900 text-sm py-2 ${
                            regErrors.phone ? 'border-rose-300 bg-rose-50/20 is-invalid' : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                      </div>
                      {regErrors.phone && (
                        <div className="text-[11px] text-danger font-semibold mt-1 d-flex align-items-center gap-1">
                          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                          <span>{regErrors.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Đăng Nhập */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-0">
                          Email Đăng Nhập <span className="text-danger">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Chuẩn email</span>
                      </div>
                      <div className="input-group">
                        <span className={`input-group-text ${regErrors.email ? 'bg-rose-50 border-rose-300 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder="khachhang@email.com"
                          className={`form-control text-slate-900 text-sm py-2 ${
                            regErrors.email ? 'border-rose-300 bg-rose-50/20 is-invalid' : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                      </div>
                      {regErrors.email && (
                        <div className="text-[11px] text-danger font-semibold mt-1 d-flex align-items-center gap-1">
                          <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                          <span>{regErrors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Mật Khẩu và Xác Nhận Mật Khẩu */}
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-0">
                            Mật Khẩu <span className="text-danger">*</span>
                          </label>
                        </div>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: '' }));
                          }}
                          placeholder="••••••••"
                          className={`form-control text-slate-900 text-sm py-2 ${
                            regErrors.password ? 'border-rose-300 bg-rose-50/20 is-invalid' : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                        {regErrors.password && (
                          <div className="text-[10px] text-danger font-semibold mt-1 leading-tight">
                            {regErrors.password}
                          </div>
                        )}
                      </div>
                      <div className="col-6">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-0">
                            Xác Nhận <span className="text-danger">*</span>
                          </label>
                        </div>
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            if (regErrors.confirmPassword) setRegErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }}
                          placeholder="••••••••"
                          className={`form-control text-slate-900 text-sm py-2 ${
                            regErrors.confirmPassword ? 'border-rose-300 bg-rose-50/20 is-invalid' : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                        {regErrors.confirmPassword && (
                          <div className="text-[10px] text-danger font-semibold mt-1 leading-tight">
                            {regErrors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={dangXuLy}
                      className="btn btn-primary w-100 py-2.5 rounded-pill text-white font-black text-sm d-flex align-items-center justify-content-center gap-2 shadow-md transition-all mt-3 cursor-pointer"
                    >
                      {dangXuLy ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Đang đăng ký...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Tạo Tài Khoản Khách Hàng</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Nút dành cho khách ăn tại bàn muốn gọi món ngay */}
                <div className="mt-3 pt-3 border-top border-slate-100">
                  <a
                    href="?table=1"
                    className="btn btn-primary w-100 py-2.5 rounded-pill d-flex align-items-center justify-content-center gap-2 text-white font-black text-xs shadow-sm"
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
