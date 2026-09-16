/**
 * @file QuanLyKhoNguyenLieu.jsx
 * @description Màn hình Quản Lý Kho Nguyên Liệu & Nhà Cung Cấp của nhà hàng Royal Bistro.
 * Hiển thị số lượng tồn kho, định mức tối thiểu, cảnh báo nguyên liệu sắp hết, nhập thêm tồn kho nhanh chóng
 * và quản lý danh sách nhà cung cấp thực phẩm.
 * @module pages/QuanLyKhoNguyenLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

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
      const res = await axiosApi.patch(`/inventory/ingredients/${nguyenLieuChon.id}/stock`, {
        amount: soLuongNhap,
        action: 'add'
      });
      if (res.success) {
        setNguyenLieuChon(null);
        taiDuLieuKho();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi cập nhật tồn kho');
    }
  };

  // Danh sách nguyên liệu sắp cạn hoặc dưới định mức tồn tối thiểu
  const nguyenLieuSapHet = nguyenLieu.filter(
    (i) => i.is_low_stock || i.so_luong_ton <= i.dinh_muc_toi_thieu
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề thanh công cụ */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-box-seam me-1"></i>Kho & Vật Tư
            </span>
            <span className="text-xs text-slate-500 font-semibold">Tự động trừ kho theo BOM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Quản Lý Kho & Nhà Cung Cấp
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Tự động trừ kho theo Định Lượng Món Ăn (BOM) & Cảnh báo nguyên liệu sắp cạn
          </p>
        </div>

        {/* Nút chuyển đổi Tab dạng Bootstrap Button Pills */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => setTabHienTai('ingredients')}
            className={`btn btn-sm rounded-pill fw-bold text-xs px-3 py-1.5 transition-all ${
              tabHienTai === 'ingredients'
                ? 'btn-warning text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-slate-700'
            }`}
          >
            <i className="bi bi-box me-1"></i>Kho Nguyên Liệu ({nguyenLieu.length})
          </button>
          <button
            onClick={() => setTabHienTai('suppliers')}
            className={`btn btn-sm rounded-pill fw-bold text-xs px-3 py-1.5 transition-all ${
              tabHienTai === 'suppliers'
                ? 'btn-warning text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-slate-700'
            }`}
          >
            <i className="bi bi-truck me-1"></i>Nhà Cung Cấp ({nhaCungCap.length})
          </button>
        </div>
      </div>

      {/* Cảnh báo nếu có nguyên liệu sắp cạn kho dạng Bootstrap Alert */}
      {nguyenLieuSapHet.length > 0 && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3 p-3 rounded-4 shadow-sm border border-danger-subtle mb-0" role="alert">
          <div className="d-flex align-items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
            <div>
              <div className="text-xs sm:text-sm fw-bold text-danger">
                Có {nguyenLieuSapHet.length} nguyên liệu chạm hoặc dưới định mức tồn kho tối thiểu!
              </div>
              <div className="text-2xs sm:text-xs text-danger-emphasis">
                {nguyenLieuSapHet.map((i) => `${i.ten_nguyen_lieu} (còn ${i.so_luong_ton} ${i.don_vi_tinh})`).join(', ')}
              </div>
            </div>
          </div>
          <span className="badge bg-danger rounded-pill px-2.5 py-1 text-xs fw-bold">Cần Nhập Ngay</span>
        </div>
      )}

      {/* Nội dung bảng dữ liệu chính dạng Bootstrap Table */}
      {tabHienTai === 'ingredients' ? (
        <div className="card bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Tên Nguyên Liệu</th>
                  <th className="py-3 px-4">Số Lượng Tồn</th>
                  <th className="py-3 px-4">Đơn Vị</th>
                  <th className="py-3 px-4">Định Mức Tối Thiểu</th>
                  <th className="py-3 px-4">Giá Nhập TB</th>
                  <th className="py-3 px-4">Trạng Thái Kho</th>
                  <th className="py-3 px-4 text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {nguyenLieu.map((ing) => {
                  const isLow = ing.is_low_stock || ing.so_luong_ton <= ing.dinh_muc_toi_thieu;
                  return (
                    <tr key={ing.id}>
                      <td className="py-3 px-4 fw-bold text-slate-900">{ing.ten_nguyen_lieu}</td>
                      <td className="py-3 px-4 font-monospace fw-bold fs-6 text-amber-700">
                        {ing.so_luong_ton}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-uppercase text-xs fw-bold">{ing.don_vi_tinh}</td>
                      <td className="py-3 px-4 text-slate-600">{ing.dinh_muc_toi_thieu} {ing.don_vi_tinh}</td>
                      <td className="py-3 px-4 font-monospace text-xs fw-bold text-slate-700">
                        {dinhDangTienTe(ing.gia_nhap_trung_binh)}
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
                          onClick={() => setNguyenLieuChon(ing)}
                          className="btn btn-sm btn-outline-warning px-2.5 py-1 rounded-3 text-xs fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nhập Thêm</span>
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
        <div className="card bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Mã NCC</th>
                  <th className="py-3 px-4">Tên Nhà Cung Cấp</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Địa Chỉ</th>
                  <th className="py-3 px-4">Đánh Giá</th>
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

      {/* Modal Nhập Thêm Tồn Kho Nhanh dạng Bootstrap Modal */}
      {nguyenLieuChon && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
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
                      className="btn btn-warning text-white w-50 py-2 rounded-3 fw-bold text-xs shadow-sm"
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
    </div>
  );
}
