/**
 * @file QuanLyKhachHang.jsx
 * @description Màn hình Quản Lý Khách Hàng & Tài Khoản Người Dùng (CRM & Account Management).
 * Dành cho Quản trị viên (Admin) và Thu Ngân:
 * 1. Phân hệ 1 - Hồ Sơ Khách Hàng Thân Thiết (CRM): Quản lý điểm thưởng tích lũy, phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương), tổng chi tiêu, thêm, sửa, xóa hồ sơ.
 * 2. Phân hệ 2 - Quản Lý Tài Khoản Khách Hàng & Nhân Sự: Quản lý danh sách tài khoản đăng nhập (Khách Hàng, Nhân Viên, Thu Ngân, Bếp, Admin), khóa/mở khóa tài khoản, tạo tài khoản mới, cập nhật vai trò, đổi mật khẩu và xóa tài khoản.
 * @module pages/QuanLyKhachHang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState, useMemo } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';
import { useToast } from '../context/ThongBaoToastContext';
import { useAuth } from '../context/NguoiDungContext';
import { 
  Users, 
  Crown, 
  Plus, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit, 
  KeyRound, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function QuanLyKhachHang() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const laAdmin = currentUser?.role === 'admin';

  // Tab chính: 'crm' (Khách hàng CRM) hoặc 'accounts' (Tài khoản người dùng & khách hàng)
  const [tabHienTai, setTabHienTai] = useState('crm');

  // Dữ liệu CRM Khách hàng
  const [khachHang, setKhachHang] = useState([]);
  const [dangTaiCrm, setDangTaiCrm] = useState(true);
  const [tuKhoaCrm, setTuKhoaCrm] = useState('');
  const [hienModalCrm, setHienModalCrm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formCrm, setFormCrm] = useState({ ho_ten: '', so_dien_thoai: '', email: '', diem_tich_luy: 0, hang_thanh_vien: 'Dong' });

  // Dữ liệu Tài khoản Người dùng & Khách hàng (/api/users)
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([]);
  const [dangTaiAccounts, setDangTaiAccounts] = useState(false);
  const [tuKhoaAccount, setTuKhoaAccount] = useState('');
  const [locVaiTro, setLocVaiTro] = useState('all');
  const [hienModalAccount, setHienModalAccount] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formAccount, setFormAccount] = useState({
    name: '',
    email: '',
    password: '',
    so_dien_thoai: '',
    role: 'khach_hang',
    trang_thai: 'hoat_dong'
  });

  /**
   * Tải danh sách hồ sơ khách hàng CRM
   */
  const taiDanhSachKhachHang = async () => {
    try {
      setDangTaiCrm(true);
      const res = await axiosApi.get('/customers');
      if (res.success) setKhachHang(res.customers || []);
    } catch (loi) {
      console.error('Lỗi khi tải danh sách khách hàng CRM:', loi);
      toast.loi('Không thể tải danh sách khách hàng', 'Lỗi CRM');
    } finally {
      setDangTaiCrm(false);
    }
  };

  /**
   * Tải danh sách tài khoản người dùng & khách hàng
   */
  const taiDanhSachTaiKhoan = async () => {
    if (!laAdmin) return;
    try {
      setDangTaiAccounts(true);
      const res = await axiosApi.get('/users');
      if (res.success) setDanhSachTaiKhoan(res.users || []);
    } catch (loi) {
      console.error('Lỗi khi tải danh sách tài khoản:', loi);
      toast.loi('Không thể tải danh sách tài khoản', 'Lỗi Tài Khoản');
    } finally {
      setDangTaiAccounts(false);
    }
  };

  useEffect(() => {
    taiDanhSachKhachHang();
    if (laAdmin) {
      taiDanhSachTaiKhoan();
    }
  }, [laAdmin]);

  // ==================== CÁC XỬ LÝ CRM ====================

  const moModalThemCrm = () => {
    setEditingCustomer(null);
    setFormCrm({ ho_ten: '', so_dien_thoai: '', email: '', diem_tich_luy: 0, hang_thanh_vien: 'Dong' });
    setHienModalCrm(true);
  };

  const moModalSuaCrm = (c) => {
    setEditingCustomer(c);
    setFormCrm({
      ho_ten: c.ho_ten,
      so_dien_thoai: c.so_dien_thoai,
      email: c.email || '',
      diem_tich_luy: c.diem_tich_luy || 0,
      hang_thanh_vien: c.hang_thanh_vien || 'Dong'
    });
    setHienModalCrm(true);
  };

  const xuLyLuuCrm = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Cập nhật khách hàng
        const res = await axiosApi.put(`/customers/${editingCustomer.id}`, formCrm);
        if (res.success) {
          toast.thanhCong('Đã cập nhật hồ sơ khách hàng thành công!', 'CRM Khách Hàng');
          setHienModalCrm(false);
          taiDanhSachKhachHang();
        }
      } else {
        // Thêm khách hàng mới
        const res = await axiosApi.post('/customers', formCrm);
        if (res.success) {
          toast.thanhCong('Thêm khách hàng thân thiết thành công!', 'CRM Khách Hàng');
          setHienModalCrm(false);
          taiDanhSachKhachHang();
        }
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi lưu hồ sơ khách hàng', 'Lỗi CRM');
    }
  };

  const xuLyXoaCrm = async (id, hoTen) => {
    if (!window.confirm(`Bạn có chắc muốn xóa hồ sơ khách hàng "${hoTen}"?`)) return;
    try {
      const res = await axiosApi.delete(`/customers/${id}`);
      if (res.success) {
        toast.thanhCong(`Đã xóa hồ sơ khách hàng ${hoTen}!`, 'CRM Khách Hàng');
        taiDanhSachKhachHang();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi xóa khách hàng', 'Lỗi CRM');
    }
  };

  const layHuyHieuHang = (hang) => {
    switch (hang) {
      case 'KimCuong':
        return { label: 'Kim Cương', color: 'badge-tier-diamond' };
      case 'Vang':
        return { label: 'Vàng', color: 'badge-tier-gold' };
      case 'Bac':
        return { label: 'Bạc', color: 'badge-tier-silver' };
      default:
        return { label: 'Đồng', color: 'badge-tier-bronze' };
    }
  };

  const khachHangLoc = useMemo(() => {
    return khachHang.filter((c) =>
      c.ho_ten.toLowerCase().includes(tuKhoaCrm.toLowerCase()) ||
      c.so_dien_thoai.includes(tuKhoaCrm)
    );
  }, [khachHang, tuKhoaCrm]);

  // ==================== CÁC XỬ LÝ TÀI KHOẢN (ACCOUNTS) ====================

  const moModalThemAccount = () => {
    setEditingUser(null);
    setFormAccount({
      name: '',
      email: '',
      password: '',
      so_dien_thoai: '',
      role: 'khach_hang',
      trang_thai: 'hoat_dong'
    });
    setHienModalAccount(true);
  };

  const moModalSuaAccount = (u) => {
    setEditingUser(u);
    setFormAccount({
      name: u.name,
      email: u.email,
      password: '', // để trống nếu không đổi
      so_dien_thoai: u.so_dien_thoai || '',
      role: u.role,
      trang_thai: u.trang_thai || 'hoat_dong'
    });
    setHienModalAccount(true);
  };

  const xuLyLuuAccount = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...formAccount };
        if (!payload.password) delete payload.password; // không đổi mật khẩu nếu bỏ trống
        const res = await axiosApi.put(`/users/${editingUser.id}`, payload);
        if (res.success) {
          toast.thanhCong('Cập nhật thông tin tài khoản thành công!', 'Quản Lý Tài Khoản');
          setHienModalAccount(false);
          taiDanhSachTaiKhoan();
        }
      } else {
        if (!formAccount.password || formAccount.password.length < 6) {
          toast.loi('Mật khẩu tài khoản phải có ít nhất 6 ký tự!', 'Lỗi');
          return;
        }
        const res = await axiosApi.post('/users', formAccount);
        if (res.success) {
          toast.thanhCong('Tạo tài khoản người dùng / khách hàng mới thành công!', 'Quản Lý Tài Khoản');
          setHienModalAccount(false);
          taiDanhSachTaiKhoan();
          taiDanhSachKhachHang();
        }
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi lưu tài khoản', 'Lỗi Tài Khoản');
    }
  };

  const xuLyDoiTrangThaiAccount = async (id, currentStatus, name) => {
    try {
      const res = await axiosApi.patch(`/users/${id}/status`);
      if (res.success) {
        toast.thanhCong(
          `Đã ${currentStatus === 'hoat_dong' ? 'tạm khóa' : 'mở khóa'} tài khoản "${name}"!`,
          'Trạng Thái Tài Khoản'
        );
        taiDanhSachTaiKhoan();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi đổi trạng thái tài khoản', 'Lỗi');
    }
  };

  const xuLyXoaAccount = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      const res = await axiosApi.delete(`/users/${id}`);
      if (res.success) {
        toast.thanhCong(`Đã xóa vĩnh viễn tài khoản "${name}"!`, 'Xóa Tài Khoản');
        taiDanhSachTaiKhoan();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi xóa tài khoản', 'Lỗi');
    }
  };

  const layHuyHieuVaiTro = (vaiTro) => {
    switch (vaiTro) {
      case 'admin':
        return { label: 'Quản Lý (Admin)', color: 'badge-role-admin' };
      case 'bep':
        return { label: 'Bếp Trưởng', color: 'badge-role-bep' };
      case 'thu_ngan':
        return { label: 'Thu Ngân', color: 'badge-role-thungan' };
      case 'khach_hang':
      case 'customer':
        return { label: 'Khách Hàng', color: 'badge-role-khachhang' };
      case 'nhan_vien':
      default:
        return { label: 'Phục Vụ', color: 'badge-role-phucvu' };
    }
  };

  const danhSachTaiKhoanLoc = useMemo(() => {
    return danhSachTaiKhoan.filter((u) => {
      const matchRole = locVaiTro === 'all' ? true : u.role === locVaiTro;
      const kw = tuKhoaAccount.toLowerCase();
      const matchSearch = !kw || 
        u.name.toLowerCase().includes(kw) || 
        u.email.toLowerCase().includes(kw) || 
        (u.so_dien_thoai && u.so_dien_thoai.includes(kw));
      return matchRole && matchSearch;
    });
  }, [danhSachTaiKhoan, locVaiTro, tuKhoaAccount]);

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Tab điều hướng chính */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-person-lines-fill me-1"></i>Hệ Thống Thành Viên
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Quản lý tài khoản đăng nhập & chăm sóc khách hàng
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Khách Hàng & Quản Lý Tài Khoản
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Hồ sơ tích điểm CRM, hạng thành viên VIP và tài khoản người dùng hệ thống
          </p>
        </div>

        {/* Nút chuyển đổi Tab */}
        <div className="d-flex items-center gap-2 w-100 w-md-auto">
          <div className="d-flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-3 border border-slate-200 w-100 w-md-auto">
            <button
              type="button"
              onClick={() => setTabHienTai('crm')}
              className={`btn btn-sm rounded-2 font-bold px-3 py-1.5 transition-all text-xs flex-grow-1 flex-md-grow-0 ${
                tabHienTai === 'crm'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-light bg-transparent text-slate-600 border-0 hover:bg-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 inline me-1.5" />
              <span>Hồ Sơ Khách Hàng (CRM)</span>
            </button>

            {laAdmin && (
              <button
                type="button"
                onClick={() => setTabHienTai('accounts')}
                className={`btn btn-sm rounded-2 font-bold px-3 py-1.5 transition-all text-xs flex-grow-1 flex-md-grow-0 ${
                  tabHienTai === 'accounts'
                    ? 'btn-primary text-white shadow-xs'
                    : 'btn-light bg-transparent text-slate-600 border-0 hover:bg-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 inline me-1.5 text-rose-500" />
                <span>Tài Khoản Khách & Nhân Sự (Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PHÂN HỆ 1: HỒ SƠ KHÁCH HÀNG THÂN THIẾT CRM               */}
      {/* ========================================================= */}
      {tabHienTai === 'crm' && (
        <div className="space-y-4">
          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2.5">
            <div className="input-group input-group-sm w-100 max-w-sm">
              <span className="input-group-text bg-white border-slate-200 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={tuKhoaCrm}
                onChange={(e) => setTuKhoaCrm(e.target.value)}
                placeholder="Tìm theo tên hoặc SĐT khách..."
                className="form-control bg-white border-slate-200 text-xs py-2"
              />
            </div>

            <button
              onClick={moModalThemCrm}
              className="btn btn-primary text-white font-black px-4 py-2.5 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-xs shrink-0 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Hồ Sơ Khách Hàng</span>
            </button>
          </div>

          <div className="card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider border-bottom border-slate-200/90">
                  <tr>
                    <th className="py-3.5 px-4">Khách Hàng</th>
                    <th className="py-3.5 px-4">Số Điện Thoại</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Điểm Tích Lũy</th>
                    <th className="py-3.5 px-4">Hạng Thành Viên</th>
                    <th className="py-3.5 px-4 text-end">Tổng Chi Tiêu</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {khachHangLoc.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400 font-semibold">
                        Chưa tìm thấy khách hàng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    khachHangLoc.map((c) => {
                      const thongTinHang = layHuyHieuHang(c.hang_thanh_vien);
                      return (
                        <tr key={c.id}>
                          <td className="py-3 px-4 fw-bold text-slate-900">
                            <div className="d-flex align-items-center gap-2.5">
                              <div className="w-8 h-8 rounded-circle bg-amber-100 d-flex align-items-center justify-content-center font-black text-amber-800 text-xs shadow-xs">
                                {c.ho_ten.charAt(0)}
                              </div>
                              <span>{c.ho_ten}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 tabular-nums fw-semibold whitespace-nowrap">{c.so_dien_thoai}</td>
                          <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                          <td className="py-3 px-4 tabular-nums fw-bold text-amber-700 whitespace-nowrap">
                            {c.diem_tich_luy} pts
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`badge rounded-pill px-3 py-1 text-xs font-black border d-inline-flex align-items-center gap-1.5 ${thongTinHang.color}`}>
                              <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{thongTinHang.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 tabular-nums fw-bold text-success text-end whitespace-nowrap">
                            {dinhDangTienTe(c.tong_chi_tieu || 0)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="d-flex align-items-center justify-content-center gap-1.5">
                              <button
                                onClick={() => moModalSuaCrm(c)}
                                className="btn btn-sm btn-outline-primary p-1.5 rounded-2"
                                title="Chỉnh sửa thông tin / Điểm tích lũy"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => xuLyXoaCrm(c.id, c.ho_ten)}
                                className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
                                title="Xóa hồ sơ khách hàng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHÂN HỆ 2: QUẢN LÝ TÀI KHOẢN KHÁCH & NGƯỜI DÙNG (ADMIN)  */}
      {/* ========================================================= */}
      {tabHienTai === 'accounts' && laAdmin && (
        <div className="space-y-4">
          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2.5">
            <div className="d-flex flex-column flex-sm-row items-stretch sm:items-center gap-2 flex-grow-1">
              <div className="input-group input-group-sm flex-grow-1">
                <span className="input-group-text bg-white border-slate-200 text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={tuKhoaAccount}
                  onChange={(e) => setTuKhoaAccount(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="form-control bg-white border-slate-200 text-xs py-2"
                />
              </div>

              <select
                value={locVaiTro}
                onChange={(e) => setLocVaiTro(e.target.value)}
                className="form-select form-select-sm bg-white border-slate-200 text-xs py-2 font-bold w-100 sm:w-auto"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="khach_hang">Khách Hàng</option>
                <option value="nhan_vien">Phục Vụ</option>
                <option value="thu_ngan">Thu Ngân</option>
                <option value="bep">Bếp Trưởng</option>
                <option value="admin">Quản Lý (Admin)</option>
              </select>
            </div>

            <button
              onClick={moModalThemAccount}
              className="btn btn-primary text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-xs shrink-0 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Tài Khoản Mới</span>
            </button>
          </div>

          <div className="card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider border-bottom border-slate-200/90">
                  <tr>
                    <th className="py-3.5 px-4">Họ và Tên</th>
                    <th className="py-3.5 px-4">Email Đăng Nhập</th>
                    <th className="py-3.5 px-4">Số Điện Thoại</th>
                    <th className="py-3.5 px-4">Vai Trò Hệ Thống</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {danhSachTaiKhoanLoc.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400 font-semibold">
                        Không tìm thấy tài khoản nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    danhSachTaiKhoanLoc.map((u) => {
                      const vaiTroHuyHieu = layHuyHieuVaiTro(u.role);
                      const dangHoatDong = u.trang_thai === 'hoat_dong';
                      return (
                        <tr key={u.id}>
                          <td className="py-3 px-4 fw-bold text-slate-900">
                            <div className="d-flex align-items-center gap-2.5">
                              <div className="w-8 h-8 rounded-circle bg-slate-100 border border-slate-200 d-flex align-items-center justify-content-center font-black text-slate-700 text-xs">
                                {u.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div>{u.name}</div>
                                <span className="text-[10px] text-slate-400 font-mono">ID: #{u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-xs">{u.email}</td>
                          <td className="py-3 px-4 font-mono text-slate-600 text-xs">{u.so_dien_thoai || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`badge rounded-pill px-2.5 py-1 text-xs font-black border ${vaiTroHuyHieu.color}`}>
                              {vaiTroHuyHieu.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {dangHoatDong ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill text-xs fw-bold d-inline-flex align-items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-circle bg-success"></span>
                                Hoạt động
                              </span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill text-xs fw-bold d-inline-flex align-items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-circle bg-danger"></span>
                                Tạm khóa
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="d-flex align-items-center justify-content-center gap-1.5">
                              {/* Nút Khóa / Mở Khóa */}
                              <button
                                onClick={() => xuLyDoiTrangThaiAccount(u.id, u.trang_thai, u.name)}
                                className={`btn btn-sm p-1.5 rounded-2 ${
                                  dangHoatDong ? 'btn-outline-warning' : 'btn-outline-success'
                                }`}
                                title={dangHoatDong ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                              >
                                {dangHoatDong ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Nút Sửa thông tin & Mật khẩu */}
                              <button
                                onClick={() => moModalSuaAccount(u)}
                                className="btn btn-sm btn-outline-primary p-1.5 rounded-2"
                                title="Chỉnh sửa thông tin / Đổi mật khẩu"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Nút Xóa vĩnh viễn */}
                              <button
                                onClick={() => xuLyXoaAccount(u.id, u.name)}
                                className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
                                title="Xóa tài khoản khỏi hệ thống"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL THÊM / SỬA KHÁCH HÀNG CRM                          */}
      {/* ========================================================= */}
      {hienModalCrm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <Crown className="w-4 h-4 text-warning" />
                  <span>{editingCustomer ? 'Sửa Khách Hàng CRM' : 'Thêm Khách Hàng CRM'}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setHienModalCrm(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={xuLyLuuCrm} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      value={formCrm.ho_ten}
                      onChange={(e) => setFormCrm({ ...formCrm, ho_ten: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingCustomer}
                      value={formCrm.so_dien_thoai}
                      onChange={(e) => setFormCrm({ ...formCrm, so_dien_thoai: e.target.value })}
                      placeholder="0912345678"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={formCrm.email}
                      onChange={(e) => setFormCrm({ ...formCrm, email: e.target.value })}
                      placeholder="khachhang@gmail.com"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  {editingCustomer && (
                    <>
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Điểm Tích Lũy</label>
                        <input
                          type="number"
                          value={formCrm.diem_tich_luy}
                          onChange={(e) => setFormCrm({ ...formCrm, diem_tich_luy: e.target.value })}
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Hạng Thành Viên</label>
                        <select
                          value={formCrm.hang_thanh_vien}
                          onChange={(e) => setFormCrm({ ...formCrm, hang_thanh_vien: e.target.value })}
                          className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold"
                        >
                          <option value="Dong">Hạng Đồng</option>
                          <option value="Bac">Hạng Bạc</option>
                          <option value="Vang">Hạng Vàng</option>
                          <option value="KimCuong">Hạng Kim Cương</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="pt-2 d-flex gap-2">
                    <button type="button" onClick={() => setHienModalCrm(false)} className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs">
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary text-white w-50 py-2.5 rounded-pill font-black text-xs shadow-sm cursor-pointer">
                      Lưu Hồ Sơ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL THÊM / SỬA TÀI KHOẢN NGƯỜI DÙNG & KHÁCH HÀNG (ADMIN)*/}
      {/* ========================================================= */}
      {hienModalAccount && laAdmin && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setHienModalAccount(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={xuLyLuuAccount} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      value={formAccount.name}
                      onChange={(e) => setFormAccount({ ...formAccount, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      disabled={!!editingUser}
                      value={formAccount.email}
                      onChange={(e) => setFormAccount({ ...formAccount, email: e.target.value })}
                      placeholder="user@nhahang.com"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={formAccount.so_dien_thoai}
                      onChange={(e) => setFormAccount({ ...formAccount, so_dien_thoai: e.target.value })}
                      placeholder="0912345678"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      {editingUser ? 'Đổi Mật Khẩu (Bỏ trống nếu giữ nguyên)' : 'Mật Khẩu'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formAccount.password}
                      onChange={(e) => setFormAccount({ ...formAccount, password: e.target.value })}
                      placeholder="••••••••"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Phân Quyền Vai Trò</label>
                    <select
                      value={formAccount.role}
                      onChange={(e) => setFormAccount({ ...formAccount, role: e.target.value })}
                      className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold"
                    >
                      <option value="khach_hang">Khách Hàng (Tài khoản đặt bàn/gọi món)</option>
                      <option value="nhan_vien">Nhân Viên Phục Vụ</option>
                      <option value="thu_ngan">Thu Ngân</option>
                      <option value="bep">Bếp Trưởng</option>
                      <option value="admin">Quản Lý (Admin)</option>
                    </select>
                  </div>

                  <div className="pt-2 d-flex gap-2">
                    <button type="button" onClick={() => setHienModalAccount(false)} className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs">
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary text-white w-50 py-2 rounded-3 fw-bold text-xs shadow-sm">
                      Lưu Tài Khoản
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
