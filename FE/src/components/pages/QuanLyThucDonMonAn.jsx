/**
 * @file QuanLyThucDonMonAn.jsx
 * @description Màn hình Quản Lý Thực Đơn Món Ăn của nhà hàng Royal Bistro.
 * Cho phép xem danh sách món ăn, tìm kiếm theo tên/loại món, thêm món ăn mới với giá bán và danh mục, xóa món khỏi thực đơn.
 * @module pages/QuanLyThucDonMonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component Quản lý Thực đơn Món ăn
 */
export default function QuanLyThucDonMonAn() {
  // Danh sách các món ăn
  const [danhSachMon, setDanhSachMon] = useState([]);
  // Danh mục loại món ăn
  const [danhMuc, setDanhMuc] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Trạng thái hiển thị modal thêm món mới
  const [hienModal, setHienModal] = useState(false);
  // Từ khóa tìm kiếm món ăn
  const [tuKhoa, setTuKhoa] = useState('');
  // Biểu mẫu nhập thông tin món ăn mới
  const [duLieuForm, setDuLieuForm] = useState({
    ten_mon: '',
    loai_mon_id: 1,
    gia: '',
    mo_ta: '',
    hinh_anh: '',
    trang_thai: 'con_hang'
  });

  /**
   * Tải toàn bộ danh sách món ăn và danh mục từ máy chủ
   */
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      const [dRes, cRes] = await Promise.all([
        axiosApi.get('/dishes'),
        axiosApi.get('/dishes/categories')
      ]);
      if (dRes.success) setDanhSachMon(dRes.dishes);
      if (cRes.success) setDanhMuc(cRes.categories);
    } catch (loi) {
      console.error('Lỗi khi tải thực đơn:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  /**
   * Xử lý thêm món ăn mới vào hệ thống
   * @param {Event} e - Sự kiện submit biểu mẫu
   */
  const xuLyThemMon = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosApi.post('/dishes', {
        ...duLieuForm,
        gia: Number(duLieuForm.gia)
      });
      if (res.success) {
        setHienModal(false);
        setDuLieuForm({
          ten_mon: '',
          loai_mon_id: 1,
          gia: '',
          mo_ta: '',
          hinh_anh: '',
          trang_thai: 'con_hang'
        });
        taiDuLieu();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi thêm món ăn');
    }
  };

  /**
   * Xử lý xóa món ăn khỏi thực đơn
   * @param {string|number} id - ID món ăn cần xóa
   */
  const xuLyXoaMon = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?')) return;
    try {
      const res = await axiosApi.delete(`/dishes/${id}`);
      if (res.success) taiDuLieu();
    } catch (loi) {
      alert(loi.message || 'Lỗi khi xóa món');
    }
  };

  // Lọc món ăn theo từ khóa tìm kiếm
  const monLocTheoTimKiem = danhSachMon.filter(d => 
    d.ten_mon.toLowerCase().includes(tuKhoa.toLowerCase()) || 
    (d.ten_loai && d.ten_loai.toLowerCase().includes(tuKhoa.toLowerCase()))
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề trang & Thanh công cụ */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 text-xs fw-bold">
              <i className="bi bi-book me-1"></i>Thực Đơn
            </span>
            <span className="text-xs text-slate-500 font-semibold">{danhSachMon.length} món trong hệ thống</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Quản Lý Thực Đơn Nhà Hàng
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Danh mục món ăn, hình ảnh, giá bán và cấu hình trạng thái
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
              placeholder="Tìm tên món ăn..."
              className="form-control bg-white border-slate-200 text-xs"
            />
          </div>
          <button
            onClick={() => setHienModal(true)}
            className="btn btn-warning text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm shrink-0"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Thêm Món Mới</span>
          </button>
        </div>
      </div>

      {/* Lưới danh sách món ăn sử dụng Bootstrap Row / Col */}
      <div className="row g-3 g-md-4">
        {monLocTheoTimKiem.map((mon) => (
          <div key={mon.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="position-relative" style={{ height: '170px' }}>
                <img
                  src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                  alt={mon.ten_mon}
                  className="w-100 h-100 object-cover"
                />
                <span className="badge bg-white text-amber-900 border border-amber-200 position-absolute top-2 start-2 px-2.5 py-1 rounded-pill shadow-xs fw-bold text-xs">
                  <i className="bi bi-tag-fill me-1 text-amber-600"></i>{mon.ten_loai}
                </span>
              </div>

              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <h4 className="card-title text-sm sm:text-base font-extrabold text-slate-900 mb-1 line-clamp-1">
                    {mon.ten_mon}
                  </h4>
                  <p className="card-text text-xs text-slate-500 line-clamp-2 mb-3">
                    {mon.mo_ta || 'Đặc sản thơm ngon hảo hạng phục vụ tại bàn.'}
                  </p>
                </div>

                <div className="pt-2 border-top border-slate-100 d-flex align-items-center justify-content-between">
                  <span className="text-sm sm:text-base font-black text-amber-600">
                    {dinhDangTienTe(mon.gia)}
                  </span>
                  <button
                    onClick={() => xuLyXoaMon(mon.id)}
                    className="btn btn-sm btn-outline-danger rounded-3 p-1.5 d-flex align-items-center justify-content-center"
                    title="Xóa món"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Món Ăn Mới dạng Bootstrap Modal */}
      {hienModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-base font-black text-slate-900 d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle-fill text-warning"></i>
                  <span>Thêm Món Ăn Mới</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setHienModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={xuLyThemMon} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Tên Món Ăn
                    </label>
                    <input
                      type="text"
                      required
                      value={duLieuForm.ten_mon}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, ten_mon: e.target.value })}
                      placeholder="Ví dụ: Bò Wagyu Nướng..."
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Danh Mục
                      </label>
                      <select
                        value={duLieuForm.loai_mon_id}
                        onChange={(e) => setDuLieuForm({ ...duLieuForm, loai_mon_id: Number(e.target.value) })}
                        className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2"
                      >
                        {danhMuc.map((c) => (
                          <option key={c.id} value={c.id}>{c.ten_loai}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                        Giá Bán (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={duLieuForm.gia}
                        onChange={(e) => setDuLieuForm({ ...duLieuForm, gia: e.target.value })}
                        placeholder="250000"
                        className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      URL Hình Ảnh
                    </label>
                    <input
                      type="url"
                      value={duLieuForm.hinh_anh}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, hinh_anh: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                      Mô Tả Hương Vị & Thành Phần
                    </label>
                    <textarea
                      rows="2"
                      value={duLieuForm.mo_ta}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, mo_ta: e.target.value })}
                      placeholder="Thịt bò mềm mọng nước, sốt tiêu đen nồng ấm..."
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    ></textarea>
                  </div>

                  <div className="pt-3 d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHienModal(false)}
                      className="btn btn-light border w-50 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning text-white w-50 py-2 rounded-3 fw-bold text-xs shadow-sm"
                    >
                      Lưu Món Mới
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
