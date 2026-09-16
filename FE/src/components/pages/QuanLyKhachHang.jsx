/**
 * @file QuanLyKhachHang.jsx
 * @description Màn hình Quản Lý Khách Hàng Thân Thiết (CRM - Customer Relationship Management).
 * Quản lý điểm tích lũy, phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương), lịch sử chi tiêu và thêm hồ sơ khách hàng mới.
 * @module pages/QuanLyKhachHang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component Quản lý Khách hàng thân thiết
 */
export default function QuanLyKhachHang() {
  // Danh sách khách hàng thân thiết
  const [khachHang, setKhachHang] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Từ khóa tìm kiếm khách hàng
  const [tuKhoa, setTuKhoa] = useState('');
  // Trạng thái hiển thị modal thêm khách hàng
  const [hienModal, setHienModal] = useState(false);
  // Biểu mẫu thêm khách hàng mới
  const [duLieuForm, setDuLieuForm] = useState({ ho_ten: '', so_dien_thoai: '', email: '' });

  /**
   * Tải toàn bộ danh sách khách hàng từ máy chủ
   */
  const taiDanhSachKhachHang = async () => {
    try {
      setDangTai(true);
      const res = await axiosApi.get('/customers');
      if (res.success) setKhachHang(res.customers);
    } catch (loi) {
      console.error('Lỗi khi tải danh sách khách hàng:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSachKhachHang();
  }, []);

  /**
   * Xử lý thêm khách hàng mới vào hệ thống
   * @param {Event} e - Sự kiện submit
   */
  const xuLyThemKhachHang = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosApi.post('/customers', duLieuForm);
      if (res.success) {
        setHienModal(false);
        setDuLieuForm({ ho_ten: '', so_dien_thoai: '', email: '' });
        taiDanhSachKhachHang();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi thêm khách hàng');
    }
  };

  /**
   * Lấy cấu hình nhãn và màu sắc huy hiệu theo hạng thành viên
   * @param {string} hang - Hạng thành viên ('Dong', 'Bac', 'Vang', 'KimCuong')
   * @returns {Object} Thông tin nhãn hiển thị và màu sắc Tailwind
   */
  const layHuyHieuHang = (hang) => {
    switch (hang) {
      case 'KimCuong':
        return { label: 'Kim Cương', color: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
      case 'Vang':
        return { label: 'Vàng', color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'Bac':
        return { label: 'Bạc', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: 'Đồng', color: 'bg-orange-50 text-orange-900 border-orange-300' };
    }
  };

  // Lọc khách hàng theo từ khóa họ tên hoặc số điện thoại
  const khachHangLoc = khachHang.filter(
    (c) =>
      c.ho_ten.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      c.so_dien_thoai.includes(tuKhoa)
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Thanh công cụ */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-person-badge me-1"></i>Khách Hàng
            </span>
            <span className="text-xs text-slate-500 font-semibold">{khachHang.length} hồ sơ thành viên</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Khách Hàng Thân Thiết (CRM)
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Quản lý điểm tích lũy, hạng VIP và lịch sử chi tiêu
          </p>
        </div>

        <div className="d-flex align-items-center gap-2.5">
          <div className="input-group input-group-sm" style={{ minWidth: '220px' }}>
            <span className="input-group-text bg-white border-slate-200 text-slate-400">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên, SĐT..."
              className="form-control bg-white border-slate-200 text-xs"
            />
          </div>
          <button
            onClick={() => setHienModal(true)}
            className="btn btn-warning text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Bảng danh sách khách hàng dạng Bootstrap Table */}
      <div className="card bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Họ Tên</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Điểm Tích Lũy</th>
                <th className="py-3 px-4">Hạng Thành Viên</th>
                <th className="py-3 px-4 text-end">Tổng Chi Tiêu</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {khachHangLoc.map((c) => {
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
                    <td className="py-3 px-4 font-monospace fw-semibold">{c.so_dien_thoai}</td>
                    <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                    <td className="py-3 px-4 font-monospace fw-bold text-amber-700">
                      {c.diem_tich_luy} pts
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold border d-inline-flex align-items-center gap-1 ${thongTinHang.color}`}>
                        <Crown className="w-3 h-3" />
                        <span>{thongTinHang.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-monospace fw-bold text-success text-end">
                      {dinhDangTienTe(c.tong_chi_tieu || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Khách Hàng Thân Thiết dạng Bootstrap Modal */}
      {hienModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <i className="bi bi-person-plus-fill text-warning"></i>
                  <span>Thêm Khách Hàng</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setHienModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={xuLyThemKhachHang} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      value={duLieuForm.ho_ten}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, ho_ten: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
                    <input
                      type="text"
                      required
                      value={duLieuForm.so_dien_thoai}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, so_dien_thoai: e.target.value })}
                      placeholder="0912345678"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Email (Tùy chọn)</label>
                    <input
                      type="email"
                      value={duLieuForm.email}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, email: e.target.value })}
                      placeholder="khachhang@gmail.com"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>
                  <div className="pt-2 d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHienModal(false)}
                      className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning text-white w-50 py-2 rounded-3 fw-bold text-xs shadow-sm"
                    >
                      Lưu Hồ Sơ
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
