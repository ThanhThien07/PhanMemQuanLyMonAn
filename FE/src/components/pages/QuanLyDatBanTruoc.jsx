/**
 * @file QuanLyDatBanTruoc.jsx
 * @description Màn hình Quản Lý Đặt Bàn Trước (Reservation) của nhà hàng Royal Bistro.
 * Cho phép tiếp nhận thông tin khách đặt chỗ, số lượng khách, tiền cọc, thời gian hẹn, thực hiện check-in đón khách hoặc hủy đặt chỗ.
 * @module pages/QuanLyDatBanTruoc
 * @author Nguyễn Hoàng Hưng
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe, dinhDangNgayGio } from '../utils/dinhDangDuLieu';
import { Plus, Phone, Users, Sparkles, CheckCircle, QrCode, X, ExternalLink, Copy, Printer } from 'lucide-react';

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

  /**
   * In mã QR bàn ăn để dán lên bàn khi mã cũ bị mất hoặc hư hại
   */
  const inMaQRBan = (ban) => {
    if (!ban) return;
    const printWin = window.open('', '_blank', 'width=650,height=750');
    if (!printWin) {
      alert('Trình duyệt đã chặn cửa sổ pop-up in. Vui lòng cấp quyền mở pop-up.');
      return;
    }
    const qrUrl = `${window.location.origin}/?table=${ban.id}`;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>In Mã QR Bàn ${ban.so_ban} - Royal Bistro</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap');
            * { box-sizing: border-box; font-family: 'Lora', Georgia, serif; }
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f8fafc;
            }
            .qr-card {
              width: 330px;
              border: 3px solid #1e40af;
              border-radius: 24px;
              padding: 24px;
              text-align: center;
              background: #ffffff;
            }
            .brand {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #1e3a8a;
              margin-bottom: 2px;
              text-transform: uppercase;
            }
            .sub-brand {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 14px;
            }
            .table-badge {
              display: inline-block;
              background: #1e40af;
              color: #ffffff;
              font-size: 18px;
              font-weight: 900;
              padding: 6px 22px;
              border-radius: 9999px;
              margin-bottom: 4px;
            }
            .area-badge {
              font-size: 12px;
              color: #475569;
              font-weight: 700;
              margin-bottom: 14px;
            }
            .qr-frame {
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: 16px;
              padding: 10px;
              display: inline-block;
              margin-bottom: 12px;
            }
            .qr-image {
              width: 190px;
              height: 190px;
              display: block;
              margin: 0 auto;
              object-fit: contain;
            }
            .instructions {
              font-size: 11.5px;
              font-weight: 700;
              color: #0f172a;
              line-height: 1.4;
              margin-bottom: 8px;
            }
            .url-text {
              font-size: 10px;
              color: #64748b;
              font-family: monospace;
              word-break: break-all;
            }
            @media print {
              body { background: transparent; padding: 0; min-height: auto; }
              .qr-card { box-shadow: none; border-color: #000; width: 100%; max-width: 320px; margin: 0 auto; }
              @page { margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="brand">Royal Bistro</div>
            <div class="sub-brand">Fine Dining & Luxury Lounge</div>
            <div class="table-badge">BÀN ${ban.so_ban}</div>
            <div class="area-badge">${ban.khu_vuc || 'Tầng 1 - Sảnh Chính'}</div>
            <div class="qr-frame">
              <img class="qr-image" src="/ma_qr.jpg" alt="Mã QR Bàn ${ban.so_ban}" />
            </div>
            <div class="instructions">
              Quý khách vui lòng dùng Camera điện thoại quét mã QR để xem thực đơn & gọi món
            </div>
            <div class="url-text">${qrUrl}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Nút tạo lịch mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              Đặt Bàn
            </span>
            <span className="text-xs text-slate-500 font-semibold">{danhSachDatBan.length} lịch hẹn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Đặt Bàn Trước (Reservation)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setHienModal(true)}
          className="btn btn-primary text-white fw-bold px-4 py-2.5 rounded-pill d-inline-flex align-items-center justify-content-center gap-2 shadow-xs shrink-0 whitespace-nowrap transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Tạo Lịch Hẹn Mới</span>
        </button>
      </div>

      {/* Bảng danh sách đặt bàn tách nền, tạo khối nổi bật */}
      <div className="card bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="table table-hover align-middle mb-0 w-full min-w-[960px]">
            <thead className="table-light text-xs font-black text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Mã Đặt</th>
                <th className="py-3.5 px-4 min-w-[260px] whitespace-nowrap text-nowrap">Khách Hàng & Ghi Chú Đặc Biệt</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Bàn & Khu Vực</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Thời Gian Hẹn</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Số Khách</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Tiền Cọc</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 text-end whitespace-nowrap text-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {danhSachDatBan.map((r) => (
                <tr key={r.id}>
                  <td className="py-3.5 px-4 font-monospace fw-bold text-blue-700">{r.ma_reservation}</td>
                  <td className="py-3.5 px-4">
                    <div className="fw-bold text-slate-900 text-sm">{r.ten_khach}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {r.sdt}
                    </div>
                    {/* GHI CHÚ ĐẶC BIỆT CỦA KHÁCH */}
                    {r.ghi_chu ? (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold max-w-full">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="leading-snug">Ghi chú: {r.ghi_chu}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic mt-0.5">Không có ghi chú</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {r.so_ban ? (
                      <span className="badge bg-light text-slate-800 border px-2.5 py-1 rounded-pill text-xs fw-bold">
                        Bàn {r.so_ban} ({r.khu_vuc})
                      </span>
                    ) : (
                      <span className="text-slate-400 fst-italic text-xs">Chưa chỉ định</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-monospace text-xs text-slate-600 font-semibold whitespace-nowrap">
                    {dinhDangNgayGio(r.thoi_gian_hen)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 fw-bold text-slate-900">
                      <Users className="w-4 h-4 text-slate-400" /> {r.so_luong_khach}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 fw-bold text-success whitespace-nowrap tabular-nums">
                    {dinhDangTienTe(r.tien_coc)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold border ${
                      r.trang_thai === 'da_den' ? 'bg-success-subtle text-success border-success-subtle' :
                      r.trang_thai === 'da_huy' ? 'bg-danger-subtle text-danger border-danger-subtle' :
                      'bg-info-subtle text-info-emphasis border-info-subtle'
                    }`}>
                      {r.trang_thai === 'da_den' ? 'Đã đến' :
                       r.trang_thai === 'da_huy' ? 'Đã hủy' : 'Đã xác nhận'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-end whitespace-nowrap">
                    {r.trang_thai === 'da_xac_nhan' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => xuLyCheckin(r)}
                          className="btn btn-sm btn-success px-3.5 py-1.5 rounded-pill text-xs fw-bold text-white shadow-xs whitespace-nowrap cursor-pointer hover:shadow-md transition-all"
                          title="Xác nhận khách đã đến"
                        >
                          Check-in
                        </button>
                        <button
                          onClick={() => xuLyHuyDat(r.id)}
                          className="btn btn-sm btn-outline-danger px-3.5 py-1.5 rounded-pill text-xs fw-bold whitespace-nowrap cursor-pointer hover:shadow-md transition-all"
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
            <div className="modal-content border-2 border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden">
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

      {/* Popup Xem & In Mã QR Bàn Ăn Sau Khi Check-in */}
      {banXemQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-sm shadow-2xl p-4 sm:p-5 text-center space-y-3 overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="font-black text-base sm:text-lg text-slate-900 mb-0">Mã QR Bàn {banXemQR.so_ban}</h3>
                <p className="text-xs text-slate-500 font-medium mb-0">{banXemQR.khu_vuc || 'Tầng 1 - Sảnh Chính'}</p>
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
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-tight">{thongBaoCheckin}</span>
              </div>
            )}

            {/* Khung ảnh QR Code - Tối ưu CLS & Loading */}
            <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src="/ma_qr.jpg"
                alt={`Mã QR Bàn ${banXemQR.so_ban}`}
                width="160"
                height="160"
                loading="lazy"
                decoding="async"
                className="w-40 h-40 mx-auto rounded-xl shadow-xs object-contain bg-white p-1 border border-slate-100"
              />
              <p className="text-[11px] text-blue-900 font-bold mt-2 mb-0">
                Khách dùng camera điện thoại quét để bắt đầu gọi món
              </p>
            </div>

            {/* Nút hành động duy nhất: In Mã QR khi mã cũ bị mất hoặc rách */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => inMaQRBan(banXemQR)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-pill text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>In Mã QR Bàn (Dán Lên Bàn)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
