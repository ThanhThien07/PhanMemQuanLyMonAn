/**
 * @file QuanLyKhoNguyenLieu.jsx
 * @description Màn hình Quản Lý Kho Nguyên Liệu & Nhà Cung Cấp của nhà hàng Royal Bistro.
 * Hiển thị số lượng tồn kho, định mức tối thiểu, cảnh báo nguyên liệu sắp hết, nhập thêm tồn kho nhanh chóng
 * và quản lý danh sách nhà cung cấp thực phẩm.
 * @module pages/QuanLyKhoNguyenLieu
 * @author Nguyễn Hoàng Hưng
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';
import { AlertTriangle, Plus } from 'lucide-react';

/**
 * Component Quản lý Kho nguyên liệu & Nhà cung cấp
 */
export default function QuanLyKhoNguyenLieu() {
  // Danh sách nguyên liệu tồn kho
  const [nguyenLieu, setNguyenLieu] = useState([]);
  // Danh sách nhà cung cấp
  const [nhaCungCap, setNhaCungCap] = useState([]);
  // Tab hiện tại ('ingredients' hoặc 'suppliers')
  const [tabHienTai, setTabHienTai] = useState('ingredients');
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Nguyên liệu đang chọn để nhập thêm kho
  const [nguyenLieuChon, setNguyenLieuChon] = useState(null);
  // Số lượng nhập kho thêm
  const [soLuongNhap, setSoLuongNhap] = useState(5);

  // Modal thêm nhà cung cấp mới
  const [modalThemNCC, setModalThemNCC] = useState(false);
  const [formNCC, setFormNCC] = useState({
    ten_ncc: '',
    ma_ncc: '',
    so_dien_thoai: '',
    email: '',
    dia_chi: '',
    danh_gia_sao: 5
  });

  // Modal thêm nguyên liệu mới
  const [modalThemNL, setModalThemNL] = useState(false);
  const [formNL, setFormNL] = useState({
    ten_nguyen_lieu: '',
    don_vi_tinh: 'kg',
    so_luong_ton: 10,
    gia_nhap_trung_binh: 100000,
    dinh_muc_toi_thieu: 5,
    han_su_dung: ''
  });

  // Hạn sử dụng cập nhật khi nhập kho thêm
  const [hanSuDungNhap, setHanSuDungNhap] = useState('');

  /**
   * Tải toàn bộ danh sách nguyên liệu và nhà cung cấp
   */
  const taiDuLieuKho = async () => {
    try {
      setDangTai(true);
      const [ingRes, supRes] = await Promise.all([
        axiosApi.get('/inventory/ingredients'),
        axiosApi.get('/inventory/suppliers')
      ]);
      if (ingRes.success) setNguyenLieu(ingRes.ingredients);
      if (supRes.success) setNhaCungCap(supRes.suppliers);
    } catch (loi) {
      console.error('Lỗi khi tải dữ liệu kho:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieuKho();
  }, []);

  /**
   * Xử lý nhập thêm tồn kho cho nguyên liệu
   * @param {Event} e - Sự kiện submit biểu mẫu
   */
  const xuLyNhapThemKho = async (e) => {
    e.preventDefault();
    if (!nguyenLieuChon) return;
    try {
      const payload = {
        amount: soLuongNhap,
        action: 'add'
      };
      if (hanSuDungNhap) {
        payload.han_su_dung = hanSuDungNhap;
      }
      const res = await axiosApi.patch(`/inventory/ingredients/${nguyenLieuChon.id}/stock`, payload);
      if (res.success) {
        setNguyenLieuChon(null);
        setHanSuDungNhap('');
        taiDuLieuKho();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi cập nhật tồn kho');
    }
  };

  /**
   * Thêm nhà cung cấp mới
   */
  const xuLyThemNhaCungCap = async (e) => {
    e.preventDefault();
    if (!formNCC.ten_ncc.trim()) {
      alert('Vui lòng nhập tên nhà cung cấp!');
      return;
    }
    try {
      const res = await axiosApi.post('/inventory/suppliers', formNCC);
      if (res.success) {
        setModalThemNCC(false);
        setFormNCC({
          ten_ncc: '',
          ma_ncc: '',
          so_dien_thoai: '',
          email: '',
          dia_chi: '',
          danh_gia_sao: 5
        });
        taiDuLieuKho();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi thêm nhà cung cấp');
    }
  };

  /**
   * Thêm nguyên liệu mới vào kho
   */
  const xuLyThemNguyenLieu = async (e) => {
    e.preventDefault();
    if (!formNL.ten_nguyen_lieu.trim()) {
      alert('Vui lòng nhập tên nguyên liệu!');
      return;
    }
    try {
      const res = await axiosApi.post('/inventory/ingredients', formNL);
      if (res.success) {
        setModalThemNL(false);
        setFormNL({
          ten_nguyen_lieu: '',
          don_vi_tinh: 'kg',
          so_luong_ton: 10,
          gia_nhap_trung_binh: 100000,
          dinh_muc_toi_thieu: 5,
          han_su_dung: ''
        });
        taiDuLieuKho();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi thêm nguyên liệu');
    }
  };

  /**
   * Kiểm tra và phân loại hạn sử dụng của nguyên liệu
   */
  const kiemTraHanSuDung = (dateStr) => {
    if (!dateStr) {
      return { text: 'Chưa cập nhật', className: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
    const exp = new Date(dateStr);
    if (isNaN(exp.getTime())) {
      return { text: 'Không hợp lệ', className: 'bg-slate-100 text-slate-500' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expZero = new Date(exp);
    expZero.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expZero - today) / (1000 * 60 * 60 * 24));
    const dateFormatted = new Intl.DateTimeFormat('vi-VN').format(exp);

    if (diffDays < 0) {
      return {
        text: `⚠️ Hết hạn (${dateFormatted})`,
        className: 'bg-danger-subtle text-danger border-danger-subtle fw-bold'
      };
    } else if (diffDays <= 7) {
      return {
        text: `⏳ Sắp hết (${dateFormatted} - ${diffDays}d)`,
        className: 'bg-warning-subtle text-warning-emphasis border-warning-subtle fw-bold'
      };
    }
    return {
      text: `✅ Còn hạn (${dateFormatted})`,
      className: 'bg-success-subtle text-success border-success-subtle'
    };
  };

  // Danh sách nguyên liệu sắp cạn hoặc dưới định mức tồn tối thiểu
  const nguyenLieuSapHet = nguyenLieu.filter(
    (i) => i.is_low_stock || i.so_luong_ton <= i.dinh_muc_toi_thieu
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề thanh công cụ */}
      <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3 shrink-0">
        <div className="shrink-0">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs whitespace-nowrap text-nowrap">
              <i className="bi bi-box-seam me-1"></i>Kho & Vật Tư
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0 whitespace-nowrap text-nowrap">
            Quản Lý Kho & Nhà Cung Cấp
          </h2>
        </div>

        {/* Nút chuyển đổi Tab & Nút Hành Động Thêm Mới */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            onClick={() => setTabHienTai('ingredients')}
            className={`px-3.5 py-2 rounded-pill font-black text-xs transition-all flex-grow-1 flex-sm-grow-0 cursor-pointer border-2 ${
              tabHienTai === 'ingredients'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-400'
            }`}
          >
            <i className="bi bi-box me-1"></i>Kho Nguyên Liệu ({nguyenLieu.length})
          </button>
          <button
            onClick={() => setTabHienTai('suppliers')}
            className={`px-3.5 py-2 rounded-pill font-black text-xs transition-all flex-grow-1 flex-sm-grow-0 cursor-pointer border-2 ${
              tabHienTai === 'suppliers'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-400'
            }`}
          >
            <i className="bi bi-truck me-1"></i>Nhà Cung Cấp ({nhaCungCap.length})
          </button>

          {/* Nút thêm mới ngữ cảnh theo Tab */}
          {tabHienTai === 'ingredients' ? (
            <button
              type="button"
              onClick={() => setModalThemNL(true)}
              className="btn btn-primary text-white px-3.5 py-2 rounded-pill font-black text-xs d-inline-flex align-items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Thêm Nguyên Liệu</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalThemNCC(true)}
              className="btn btn-primary text-white px-3.5 py-2 rounded-pill font-black text-xs d-inline-flex align-items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Thêm Nhà Cung Cấp</span>
            </button>
          )}
        </div>
      </div>

      {/* Cảnh báo nếu có nguyên liệu sắp cạn kho dạng Bootstrap Alert */}
      {nguyenLieuSapHet.length > 0 && (
        <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 p-3 rounded-4 shadow-sm border border-danger-subtle mb-0" role="alert">
          <div className="d-flex align-items-start align-items-sm-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5 mt-sm-0" />
            <div>
              <div className="text-xs sm:text-sm fw-bold text-danger">
                Có {nguyenLieuSapHet.length} nguyên liệu chạm hoặc dưới định mức tồn kho tối thiểu!
              </div>
              <div className="text-2xs sm:text-xs text-danger-emphasis">
                {nguyenLieuSapHet.map((i) => `${i.ten_nguyen_lieu} (còn ${i.so_luong_ton} ${i.don_vi_tinh})`).join(', ')}
              </div>
            </div>
          </div>
          <span className="badge bg-danger rounded-pill px-2.5 py-1 text-xs fw-bold shrink-0 align-self-start align-self-sm-center">Cần Nhập Ngay</span>
        </div>
      )}

      {/* Nội dung bảng dữ liệu chính dạng Bootstrap Table */}
      {tabHienTai === 'ingredients' ? (
        <div className="card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="table-responsive overflow-x-auto">
            <table className="table table-hover align-middle mb-0 w-full min-w-[1000px]">
              <thead className="bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider border-bottom border-slate-200/90">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Tên Nguyên Liệu</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Số Lượng Tồn</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Đơn Vị</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Định Mức Tối Thiểu</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Giá Nhập TB</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Hạn Sử Dụng</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Trạng Thái Kho</th>
                  <th className="py-3.5 px-4 text-end whitespace-nowrap text-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {nguyenLieu.map((ing) => {
                  const isLow = ing.is_low_stock || ing.so_luong_ton <= ing.dinh_muc_toi_thieu;
                  const expInfo = kiemTraHanSuDung(ing.han_su_dung);
                  return (
                    <tr key={ing.id}>
                      <td className="py-3 px-4 fw-bold text-slate-900 whitespace-nowrap">{ing.ten_nguyen_lieu}</td>
                      <td className="py-3 px-4 tabular-nums fw-bold fs-6 text-amber-700 whitespace-nowrap">
                        {ing.so_luong_ton}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-uppercase text-xs fw-bold whitespace-nowrap">{ing.don_vi_tinh}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{ing.dinh_muc_toi_thieu} {ing.don_vi_tinh}</td>
                      <td className="py-3 px-4 tabular-nums text-xs fw-bold text-slate-700 whitespace-nowrap">
                        {dinhDangTienTe(ing.gia_nhap_trung_binh)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`badge rounded-pill px-2.5 py-1 text-xs border ${expInfo.className}`}>
                          {expInfo.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold border ${
                          isLow
                            ? 'bg-danger-subtle text-danger border-danger-subtle animate-pulse'
                            : 'bg-success-subtle text-success border-success-subtle'
                        }`}>
                          {isLow ? '⚠️ Sắp hết hàng' : '✅ Đầy đủ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          type="button"
                          onClick={() => {
                            setNguyenLieuChon(ing);
                            setHanSuDungNhap(ing.han_su_dung ? new Date(ing.han_su_dung).toISOString().split('T')[0] : '');
                          }}
                          className="btn btn-sm btn-outline-warning px-3 py-1 rounded-pill text-xs fw-bold d-inline-flex align-items-center gap-1 shadow-xs whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">Nhập Thêm</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bảng Nhà Cung Cấp */
        <div className="card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="table-responsive overflow-x-auto">
            <table className="table table-hover align-middle mb-0 w-full min-w-[900px]">
              <thead className="bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider border-bottom border-slate-200/90">
                <tr>
                  <th className="py-3.5 px-4">Mã NCC</th>
                  <th className="py-3.5 px-4">Tên Nhà Cung Cấp</th>
                  <th className="py-3.5 px-4">Số Điện Thoại</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Địa Chỉ</th>
                  <th className="py-3.5 px-4">Đánh Giá</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {nhaCungCap.map((sup) => (
                  <tr key={sup.id}>
                    <td className="py-3 px-4 font-monospace fw-bold text-amber-700">{sup.ma_ncc}</td>
                    <td className="py-3 px-4 fw-bold text-slate-900">{sup.ten_ncc}</td>
                    <td className="py-3 px-4 text-slate-600">{sup.so_dien_thoai}</td>
                    <td className="py-3 px-4 text-slate-600">{sup.email}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{sup.dia_chi}</td>
                    <td className="py-3 px-4 text-amber-600 fw-bold">★ {sup.danh_gia_sao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nhập Thêm Tồn Kho Nhanh & Gia Hạn Sử Dụng */}
      {nguyenLieuChon && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <i className="bi bi-box-arrow-in-down text-warning"></i>
                  <span>Nhập Thêm Kho</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNguyenLieuChon(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <div className="fw-bold text-slate-900 text-sm">{nguyenLieuChon.ten_nguyen_lieu}</div>
                  <p className="text-xs text-slate-500 font-medium mb-0">
                    Hiện còn: <span className="fw-bold text-amber-700">{nguyenLieuChon.so_luong_ton} {nguyenLieuChon.don_vi_tinh}</span>
                  </p>
                </div>

                <form onSubmit={xuLyNhapThemKho} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Số Lượng Nhập ({nguyenLieuChon.don_vi_tinh})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={soLuongNhap}
                      onChange={(e) => setSoLuongNhap(Number(e.target.value))}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 font-monospace fw-bold py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Hạn Sử Dụng Mới (Tùy chọn)
                    </label>
                    <input
                      type="date"
                      value={hanSuDungNhap}
                      onChange={(e) => setHanSuDungNhap(e.target.value)}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 py-2 text-sm"
                    />
                  </div>

                  <div className="pt-2 d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNguyenLieuChon(null)}
                      className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-white w-50 py-2.5 rounded-pill font-black text-xs shadow-sm cursor-pointer"
                    >
                      Xác Nhận
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM NHÀ CUNG CẤP MỚI */}
      {modalThemNCC && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <i className="bi bi-truck text-primary"></i>
                  <span>Thêm Nhà Cung Cấp Mới</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalThemNCC(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={xuLyThemNhaCungCap} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Tên Nhà Cung Cấp <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Công ty Thực Phẩm Sạch Vina"
                      value={formNCC.ten_ncc}
                      onChange={(e) => setFormNCC({ ...formNCC, ten_ncc: e.target.value })}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Mã NCC (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        placeholder="NCC_VINA"
                        value={formNCC.ma_ncc}
                        onChange={(e) => setFormNCC({ ...formNCC, ma_ncc: e.target.value })}
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2 font-monospace"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Số Điện Thoại
                      </label>
                      <input
                        type="text"
                        placeholder="0912 345 678"
                        value={formNCC.so_dien_thoai}
                        onChange={(e) => setFormNCC({ ...formNCC, so_dien_thoai: e.target.value })}
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Liên Hệ
                    </label>
                    <input
                      type="email"
                      placeholder="contact@supplier.vn"
                      value={formNCC.email}
                      onChange={(e) => setFormNCC({ ...formNCC, email: e.target.value })}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Địa Chỉ
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 123 Hoàng Mai, Hà Nội"
                      value={formNCC.dia_chi}
                      onChange={(e) => setFormNCC({ ...formNCC, dia_chi: e.target.value })}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                    />
                  </div>

                  <div className="pt-2 d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalThemNCC(false)}
                      className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-white w-50 py-2.5 rounded-pill font-black text-xs shadow-sm cursor-pointer"
                    >
                      Lưu Nhà Cung Cấp
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM NGUYÊN LIỆU MỚI */}
      {modalThemNL && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-sm font-black text-slate-900 d-flex align-items-center gap-1.5">
                  <i className="bi bi-box-seam text-primary"></i>
                  <span>Thêm Nguyên Liệu Mới</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalThemNL(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={xuLyThemNguyenLieu} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Tên Nguyên Liệu <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nấm Truffle Đen"
                      value={formNL.ten_nguyen_lieu}
                      onChange={(e) => setFormNL({ ...formNL, ten_nguyen_lieu: e.target.value })}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Số Lượng Tồn Ban Đầu
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={formNL.so_luong_ton}
                        onChange={(e) => setFormNL({ ...formNL, so_luong_ton: Number(e.target.value) })}
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2 font-monospace"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Đơn Vị Tính
                      </label>
                      <select
                        value={formNL.don_vi_tinh}
                        onChange={(e) => setFormNL({ ...formNL, don_vi_tinh: e.target.value })}
                        className="form-select bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                      >
                        <option value="kg">KG</option>
                        <option value="g">Gram (g)</option>
                        <option value="lít">Lít</option>
                        <option value="ml">Mililít (ml)</option>
                        <option value="hộp">Hộp</option>
                        <option value="gói">Gói</option>
                        <option value="chai">Chai</option>
                        <option value="lon">Lon</option>
                        <option value="quả">Quả</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Định Mức Tối Thiểu
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={formNL.dinh_muc_toi_thieu}
                        onChange={(e) => setFormNL({ ...formNL, dinh_muc_toi_thieu: Number(e.target.value) })}
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2 font-monospace"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Giá Nhập TB (VNĐ)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        required
                        value={formNL.gia_nhap_trung_binh}
                        onChange={(e) => setFormNL({ ...formNL, gia_nhap_trung_binh: Number(e.target.value) })}
                        className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2 font-monospace"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Hạn Sử Dụng
                    </label>
                    <input
                      type="date"
                      value={formNL.han_su_dung}
                      onChange={(e) => setFormNL({ ...formNL, han_su_dung: e.target.value })}
                      className="form-control bg-slate-50 border-slate-200 text-slate-900 text-sm py-2"
                    />
                  </div>

                  <div className="pt-2 d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalThemNL(false)}
                      className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-white w-50 py-2.5 rounded-pill font-black text-xs shadow-sm cursor-pointer"
                    >
                      Lưu Nguyên Liệu
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
