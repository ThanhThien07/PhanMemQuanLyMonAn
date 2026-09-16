/**
 * @file QuanLyDatBanTruoc.jsx
 * @description Màn hình Quản Lý Đặt Bàn Trước (Reservation) của nhà hàng Royal Bistro.
 * Cho phép tiếp nhận thông tin khách đặt chỗ, số lượng khách, tiền cọc, thời gian hẹn, thực hiện check-in đón khách hoặc hủy đặt chỗ.
 * @module pages/QuanLyDatBanTruoc
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe, dinhDangNgayGio } from '../utils/dinhDangDuLieu';

/**
 * Component Quản lý Đặt bàn trước
 */
export default function QuanLyDatBanTruoc() {
  // Danh sách lịch hẹn đặt bàn
  const [danhSachDatBan, setDanhSachDatBan] = useState([]);
  // Danh sách bàn ăn trong nhà hàng
  const [danhSachBan, setDanhSachBan] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Trạng thái hiển thị modal thêm lịch đặt
  const [hienModal, setHienModal] = useState(false);
  // Biểu mẫu nhập thông tin đặt bàn
  const [duLieuForm, setDuLieuForm] = useState({
    ten_khach: '',
    sdt: '',
    ban_id: '',
    thoi_gian_hen: '',
    so_luong_khach: 2,
    tien_coc: 0,
    ghi_chu: ''
  });

  /**
   * Tải toàn bộ danh sách lịch đặt bàn và danh sách bàn ăn
   */
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      const [resvRes, tableRes] = await Promise.all([
        axiosApi.get('/reservations'),
        axiosApi.get('/tables')
      ]);
      if (resvRes.success) setDanhSachDatBan(resvRes.reservations);
      if (tableRes.success) setDanhSachBan(tableRes.tables);
    } catch (loi) {
      console.error('Lỗi khi tải lịch đặt bàn:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  /**
   * Xử lý tạo mới lịch đặt bàn
   * @param {Event} e - Sự kiện submit
   */
  const xuLyThemLichDat = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosApi.post('/reservations', duLieuForm);
      if (res.success) {
        setHienModal(false);
        setDuLieuForm({
          ten_khach: '',
          sdt: '',
          ban_id: '',
          thoi_gian_hen: '',
          so_luong_khach: 2,
          tien_coc: 0,
          ghi_chu: ''
        });
        taiDuLieu();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi tạo lịch đặt bàn');
    }
  };

  /**
   * Xử lý đón khách (Check-in) khi khách đến nhà hàng
   * @param {string|number} id - ID lịch đặt bàn
   */
  const xuLyCheckin = async (id) => {
    try {
      const res = await axiosApi.patch(`/reservations/${id}/checkin`);
      if (res.success) taiDuLieu();
    } catch (loi) {
      alert(loi.message || 'Lỗi khi check-in khách');
    }
  };

  /**
   * Xử lý hủy lịch hẹn đặt bàn
   * @param {string|number} id - ID lịch đặt bàn
   */
  const xuLyHuyDat = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đặt bàn này?')) return;
    try {
      const res = await axiosApi.patch(`/reservations/${id}/cancel`);
      if (res.success) taiDuLieu();
    } catch (loi) {
      alert(loi.message || 'Lỗi khi hủy lịch đặt');
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Nút tạo lịch mới */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-calendar-check me-1"></i>Đặt Bàn
            </span>
            <span className="text-xs text-slate-500 font-semibold">{danhSachDatBan.length} lịch hẹn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Quản Lý Đặt Bàn Trước (Reservation)
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Tiếp nhận thông tin khách đặt chỗ, cọc tiền và đón khách
          </p>
        </div>
        <button
          onClick={() => setHienModal(true)}
          className="btn btn-warning text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Lịch Hẹn Mới</span>
        </button>
      </div>

      {/* Bảng danh sách đặt bàn dạng Bootstrap Table */}
      <div className="card bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Mã Đặt</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Bàn & Khu Vực</th>
                <th className="py-3 px-4">Thời Gian Hẹn</th>
                <th className="py-3 px-4">Số Khách</th>
                <th className="py-3 px-4">Tiền Cọc</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {danhSachDatBan.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-monospace fw-bold text-amber-700">{r.ma_reservation}</td>
                  <td className="py-3 px-4">
                    <div className="fw-bold text-slate-900">{r.ten_khach}</div>
                    <div className="text-xs text-slate-500 d-flex align-items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" /> {r.sdt}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {r.so_ban ? (
                      <span className="badge bg-light text-slate-800 border px-2.5 py-1 rounded-pill text-xs fw-bold">
                        Bàn {r.so_ban} ({r.khu_vuc})
                      </span>
                    ) : (
                      <span className="text-slate-400 fst-italic text-xs">Chưa chỉ định</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-monospace text-xs text-slate-600 font-semibold">
                    {dinhDangNgayGio(r.thoi_gian_hen)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="d-flex align-items-center gap-1 fw-bold text-slate-900">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {r.so_luong_khach}
                    </span>
                  </td>
                  <td className="py-3 px-4 fw-bold text-success">
                    {dinhDangTienTe(r.tien_coc)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold border ${
                      r.trang_thai === 'da_den' ? 'bg-success-subtle text-success border-success-subtle' :
                      r.trang_thai === 'da_huy' ? 'bg-danger-subtle text-danger border-danger-subtle' :
                      'bg-info-subtle text-info-emphasis border-info-subtle'
                    }`}>
                      {r.trang_thai === 'da_den' ? 'Đã đến' :
                       r.trang_thai === 'da_huy' ? 'Đã hủy' : 'Đã xác nhận'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-end">
                    {r.trang_thai === 'da_xac_nhan' && (
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          onClick={() => xuLyCheckin(r.id)}
                          className="btn btn-sm btn-success px-2.5 py-1 rounded-3 text-xs fw-bold text-white shadow-xs"
                          title="Xác nhận khách đã đến"
                        >
                          Check-in
                        </button>
                        <button
                          onClick={() => xuLyHuyDat(r.id)}
                          className="btn btn-sm btn-outline-danger px-2.5 py-1 rounded-3 text-xs fw-bold"
                          title="Hủy lịch đặt bàn"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Lịch Đặt Bàn Mới dạng Bootstrap Modal */}
      {hienModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-base font-black text-slate-900 d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-plus-fill text-warning"></i>
                  <span>Thêm Lịch Đặt Bàn Mới</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setHienModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={xuLyThemLichDat} className="space-y-3">
                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Tên Khách Hàng</label>
                    <input
                      type="text"
                      required
                      value={duLieuForm.ten_khach}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, ten_khach: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
                    <input
                      type="text"
                      required
                      value={duLieuForm.sdt}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, sdt: e.target.value })}
                      placeholder="0901234567"
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Chọn Bàn</label>
                      <select
                        value={duLieuForm.ban_id}
                        onChange={(e) => setDuLieuForm({ ...duLieuForm, ban_id: e.target.value })}
                        className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2"
                      >
                        <option value="">Chưa chọn bàn</option>
                        {danhSachBan.map((t) => (
                          <option key={t.id} value={t.id}>Bàn {t.so_ban} ({t.khu_vuc})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Số Lượng Khách</label>
                      <input
                        type="number"
                        min="1"
                        value={duLieuForm.so_luong_khach}
                        onChange={(e) => setDuLieuForm({ ...duLieuForm, so_luong_khach: Number(e.target.value) })}
                        className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Thời Gian Hẹn</label>
                    <input
                      type="datetime-local"
                      required
                      value={duLieuForm.thoi_gian_hen}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, thoi_gian_hen: e.target.value })}
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Tiền Cọc (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={duLieuForm.tien_coc}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, tien_coc: Number(e.target.value) })}
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">Ghi Chú Yêu Cầu</label>
                    <input
                      type="text"
                      value={duLieuForm.ghi_chu}
                      onChange={(e) => setDuLieuForm({ ...duLieuForm, ghi_chu: e.target.value })}
                      placeholder="Kỷ niệm ngày cưới, cần view đẹp..."
                      className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                    />
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
                      Lưu Đặt Bàn
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
