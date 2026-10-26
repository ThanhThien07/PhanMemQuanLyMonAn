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
import { Plus, Phone, Users, Sparkles, CheckCircle, QrCode, X, ExternalLink, Copy } from 'lucide-react';

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
  // Popup QR bàn sau khi check-in để phục vụ hướng dẫn khách
  const [banXemQR, setBanXemQR] = useState(null);
  const [thongBaoCheckin, setThongBaoCheckin] = useState('');

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
   * Sau khi checkin thành công, tự động mở popup Mã QR bàn để hướng dẫn khách quét mã gọi món!
   */
  const xuLyCheckin = async (r) => {
    try {
      const res = await axiosApi.patch(`/reservations/${r.id}/checkin`);
      if (res.success) {
        taiDuLieu();
        const banCheckin = danhSachBan.find((b) => b.id === r.ban_id) || {
          id: r.ban_id,
          so_ban: r.so_ban || r.ban_id,
          khu_vuc: r.khu_vuc || ''
        };
        setThongBaoCheckin(`Khách ${r.ten_khach} đã nhận Bàn ${banCheckin.so_ban}! Hướng dẫn khách quét mã QR để gọi món.`);
        setBanXemQR(banCheckin);
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi check-in khách');
    }
  };

  /**
   * Xử lý hủy lịch hẹn đặt bàn
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
              Đặt Bàn
            </span>
            <span className="text-xs text-slate-500 font-semibold">{danhSachDatBan.length} lịch hẹn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0">
            Quản Lý Đặt Bàn Trước (Reservation)
          </h2>
        </div>
        <button
          onClick={() => setHienModal(true)}
          className="btn btn-primary text-white fw-bold px-4 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-xs shrink-0 w-100 w-md-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Lịch Hẹn Mới</span>
        </button>
      </div>

      {/* Bảng danh sách đặt bàn tách nền, tạo khối nổi bật */}
      <div className="card bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-xs font-black text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Đặt</th>
                <th className="py-3.5 px-4">Khách Hàng & Ghi Chú Đặc Biệt</th>
                <th className="py-3.5 px-4">Bàn & Khu Vực</th>
                <th className="py-3.5 px-4">Thời Gian Hẹn</th>
                <th className="py-3.5 px-4">Số Khách</th>
                <th className="py-3.5 px-4">Tiền Cọc</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {danhSachDatBan.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-monospace fw-bold text-blue-700">{r.ma_reservation}</td>
                  <td className="py-3 px-4">
                    <div className="fw-bold text-slate-900">{r.ten_khach}</div>
                    <div className="text-xs text-slate-500 d-flex align-items-center gap-1 font-medium mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {r.sdt}
                    </div>
                    {/* GHI CHÚ ĐẶC BIỆT CỦA KHÁCH */}
                    {r.ghi_chu ? (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Ghi chú: {r.ghi_chu}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic mt-0.5">Không có ghi chú</div>
                    )}
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
                  <td className="py-3 px-4 fw-bold text-success whitespace-nowrap tabular-nums">
                    {dinhDangTienTe(r.tien_coc)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold border ${
                      r.trang_thai === 'da_den' ? 'bg-success-subtle text-success border-success-subtle' :
                      r.trang_thai === 'da_huy' ? 'bg-danger-subtle text-danger border-danger-subtle' :
                      'bg-info-subtle text-info-emphasis border-info-subtle'
                    }`}>
                      {r.trang_thai === 'da_den' ? 'Đã đến' :
                       r.trang_thai === 'da_huy' ? 'Đã hủy' : 'Đã xác nhận'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-end whitespace-nowrap">
                    {r.trang_thai === 'da_xac_nhan' && (
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => xuLyCheckin(r)}
                          className="btn btn-sm btn-success px-3.5 py-1.5 rounded-pill text-xs fw-bold text-white shadow-xs whitespace-nowrap cursor-pointer"
                          title="Xác nhận khách đã đến"
                        >
                          Check-in
                        </button>
                        <button
                          onClick={() => xuLyHuyDat(r.id)}
                          className="btn btn-sm btn-outline-danger px-3.5 py-1.5 rounded-pill text-xs fw-bold whitespace-nowrap cursor-pointer"
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
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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
                      className="btn btn-light border w-50 py-2 rounded-pill fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-white w-50 py-2 rounded-pill fw-bold text-xs shadow-sm"
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

      {/* Popup Xem Mã QR Bàn Ăn Sau Khi Check-in */}
      {banXemQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="font-black text-lg text-slate-900">Mã QR Bàn {banXemQR.so_ban}</h3>
                <p className="text-xs text-slate-500 font-medium">{banXemQR.khu_vuc || 'Khu vực bàn'}</p>
              </div>
              <button 
                onClick={() => setBanXemQR(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner Hướng Dẫn Quét Mã Nổi Bật */}
            {thongBaoCheckin && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-200/90 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{thongBaoCheckin}</span>
              </div>
            )}

            {/* Khung ảnh QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src="/ma_qr.jpg"
                alt={`Mã QR Bàn ${banXemQR.so_ban}`}
                className="w-48 h-48 mx-auto rounded-xl shadow-md object-contain bg-white p-1 border-2 border-slate-100"
              />
              <p className="text-[11px] text-blue-900 font-bold mt-2">
                Khách dùng camera điện thoại quét để bắt đầu gọi món
              </p>
            </div>

            <div className="text-2xs text-slate-500 font-mono bg-slate-100 p-2 rounded-xl break-all">
              {window.location.origin}/?table={banXemQR.id}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  window.open(`/?table=${banXemQR.id}`, '_blank');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Trang Khách Gọi Món (Tab Mới)</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?table=${banXemQR.id}`);
                  alert('Đã sao chép link quét mã của Bàn ' + banXemQR.so_ban);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao Chép Link QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
