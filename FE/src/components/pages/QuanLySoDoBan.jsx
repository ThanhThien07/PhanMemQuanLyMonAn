/**
 * @file QuanLySoDoBan.jsx
 * @description Màn hình Quản lý Sơ Đồ Bàn Ăn & Mặt Bằng Nhà Hàng (Table Management Page).
 * Tính năng chính:
 * 1. Phân loại bàn theo khu vực (Tầng 1 Sảnh chính, Tầng 2 Ban công, Phòng VIP Hoàng Gia, VIP Kim Cương).
 * 2. Đèn báo trạng thái trực quan: Trống (Xanh), Có khách (Vàng - nhấp nháy), Đã đặt (Lam).
 * 3. Hiển thị tổng tiền tạm tính và số lượng món ăn chưa thanh toán theo thời gian thực.
 * 4. Chuyển đổi trạng thái bàn nhanh chóng (Mở bàn, Dọn bàn).
 * 5. Mở Hộp thoại In Hóa Đơn (ModalInHoaDon) để thanh toán.
 * 6. Mở Popup Mã QR Bàn Ăn (sử dụng ảnh QR chuẩn nhà hàng /ma_qr.jpg) cho khách quét gọi món.
 * @module pages/QuanLySoDoBan
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import clientAxios from '../services/cauHinhAxiosApi.js';
import ModalInHoaDon from '../ModalInHoaDon.jsx';
import { dinhDangTienTe, dinhDangNgayGio } from '../utils/dinhDangDuLieu.js';
import { ExternalLink, Copy, Users, CreditCard, Utensils, CheckCircle, QrCode, X, CalendarCheck, Search, Sparkles, Phone } from 'lucide-react';
import ThanhCuonNgang from '../common/ThanhCuonNgang.jsx';
import { useToast } from '../context/ThongBaoToastContext.jsx';
import { useSocket } from '../context/SocketRealtimeContext.jsx';

export default function QuanLySoDoBan({ setActiveTab }) {
  const toast = useToast();
  const { socket } = useSocket();
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [khuVucHienTai, setKhuVucHienTai] = useState('all');
  const [dangTai, setDangTai] = useState(true);
  const [banThanhToan, setBanThanhToan] = useState(null);
  const [donMonThanhToan, setDonMonThanhToan] = useState([]);
  const [banXemQR, setBanXemQR] = useState(null);
  const [huongDanQR, setHuongDanQR] = useState('');

  // Flow tiếp đón khách tại bàn
  const [banMoTiepDon, setBanMoTiepDon] = useState(null);
  const [soKhachDon, setSoKhachDon] = useState(2);

  // Tra cứu nhanh khách đã đặt bàn
  const [hienTraCuuDatBan, setHienTraCuuDatBan] = useState(false);
  const [danhSachDatBan, setDanhSachDatBan] = useState([]);
  const [tuKhoaTraCuu, setTuKhoaTraCuu] = useState('');

  /**
   * Tải danh sách bàn ăn từ máy chủ Back-End
   */
  const taiDanhSachBan = async () => {
    try {
      setDangTai(true);
      const phanHoi = await clientAxios.get('/tables');
      if (phanHoi.success) {
        setDanhSachBan(phanHoi.tables);
      }
    } catch (err) {
      console.error('Lỗi taiDanhSachBan:', err);
    } finally {
      setDangTai(false);
    }
  };

  /**
   * Tải danh sách khách đặt bàn trước
   */
  const taiDanhSachDatBan = async () => {
    try {
      const res = await clientAxios.get('/reservations');
      if (res.success) {
        setDanhSachDatBan(res.reservations);
      }
    } catch (err) {
      console.error('Lỗi taiDanhSachDatBan:', err);
    }
  };

  useEffect(() => {
    taiDanhSachBan();
    taiDanhSachDatBan();

    if (socket) {
      const xuLyBanCapNhat = () => {
        taiDanhSachBan();
        taiDanhSachDatBan();
      };
      socket.on('table:updated', xuLyBanCapNhat);
      socket.on('staff:called', xuLyBanCapNhat);
      socket.on('payment:requested', xuLyBanCapNhat);

      return () => {
        socket.off('table:updated', xuLyBanCapNhat);
        socket.off('staff:called', xuLyBanCapNhat);
        socket.off('payment:requested', xuLyBanCapNhat);
      };
    }
  }, [socket]);

  /**
   * Mở modal thanh toán hóa đơn cho bàn
   */
  const moHoaDonBan = async (ban) => {
    try {
      const phanHoi = await clientAxios.get(`/orders?ban_id=${ban.id}&unpaid_only=true`);
      if (phanHoi.success) {
        setDonMonThanhToan(phanHoi.orders);
        setBanThanhToan(ban);
      }
    } catch (err) {
      toast.loi(err.message, 'Lỗi Thanh Toán');
    }
  };

  /**
   * Mở popup đón khách: hỏi số lượng khách và chuẩn bị mã QR
   */
  const moPopupTiepDon = (ban) => {
    setBanMoTiepDon(ban);
    setSoKhachDon(ban.suc_chua >= 4 ? 4 : 2);
  };

  /**
   * Xác nhận mở bàn cho khách vãng lai & tự động mở mã QR gọi món
   */
  const xacNhanMoBanVaLayQR = async () => {
    if (!banMoTiepDon) return;
    try {
      await clientAxios.patch(`/tables/${banMoTiepDon.id}/status`, {
        trang_thai: 'co_khach',
        so_luong_khach: Number(soKhachDon) || 2
      });
      toast.thanhCong(`Đã mở Bàn ${banMoTiepDon.so_ban} cho ${soKhachDon} khách`, 'Tiếp Đón Khách');
      taiDanhSachBan();
      
      const banVuaMo = { ...banMoTiepDon, so_luong_khach: soKhachDon, trang_thai: 'co_khach' };
      setBanMoTiepDon(null);
      // Tự động mở ngay Modal Mã QR kèm hướng dẫn phục vụ
      setHuongDanQR(`Bàn ${banVuaMo.so_ban} đã sẵn sàng. Hướng dẫn khách quét mã QR để gọi món!`);
      setBanXemQR(banVuaMo);
    } catch (err) {
      toast.loi(err.message, 'Lỗi Mở Bàn');
    }
  };

  /**
   * Check-in đón khách đã đặt bàn trước ngay trên Sơ Đồ Bàn
   */
  const xuLyCheckinLichDat = async (resv) => {
    try {
      const res = await clientAxios.patch(`/reservations/${resv.id}/checkin`);
      if (res.success) {
        toast.thanhCong(`Check-in thành công cho khách ${resv.ten_khach}!`, 'Đón Khách Đặt Bàn');
        taiDanhSachBan();
        taiDanhSachDatBan();
        setHienTraCuuDatBan(false);

        // Mở ngay QR cho bàn được checkin
        const banCheckin = danhSachBan.find((b) => b.id === resv.ban_id) || {
          id: resv.ban_id,
          so_ban: resv.so_ban || resv.ban_id,
          khu_vuc: resv.khu_vuc || ''
        };
        setHuongDanQR(`Chào mừng ${resv.ten_khach}! Hướng dẫn khách quét mã QR để bắt đầu gọi món.`);
        setBanXemQR(banCheckin);
      }
    } catch (err) {
      toast.loi(err.message, 'Lỗi Check-in');
    }
  };

  const danhSachKhuVuc = ['all', 'Tầng 1 - Sảnh Chính', 'Tầng 2 - Ban Công', 'Phòng VIP 1 (Hoàng Gia)', 'Phòng VIP 2 (Kim Cương)'];
  const banDaLoc = danhSachBan.filter((b) =>
    khuVucHienTai === 'all' ? true : b.khu_vuc.includes(khuVucHienTai) || b.khu_vuc === khuVucHienTai
  );

  // Danh sách lịch hẹn đã xác nhận hôm nay để tra cứu
  const lichHenChuaDen = danhSachDatBan.filter((r) => r.trang_thai === 'da_xac_nhan');
  const lichHenLoc = lichHenChuaDen.filter((r) => {
    if (!tuKhoaTraCuu.trim()) return true;
    const kw = tuKhoaTraCuu.toLowerCase();
    return (
      r.ten_khach?.toLowerCase().includes(kw) ||
      r.sdt?.includes(kw) ||
      String(r.so_ban).includes(kw) ||
      r.ma_reservation?.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Nút Tra Cứu Khách Đặt Bàn */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              Sơ Đồ Bàn
            </span>
            <span className="text-xs text-slate-500 font-semibold">{banDaLoc.length} bàn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0">
            Sơ Đồ Bàn & Phòng Tiệc
          </h2>
        </div>

        {/* Nút Khách Đã Đặt Bàn & Chú giải */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setHienTraCuuDatBan(true)}
            className="btn btn-outline-primary bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-pill text-xs font-bold d-flex align-items-center gap-1.5 shadow-2xs transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Khách Đã Đặt</span>
            {lichHenChuaDen.length > 0 && (
              <span className="badge bg-danger text-white rounded-pill px-1.5 py-0.5 text-[10px]">
                {lichHenChuaDen.length}
              </span>
            )}
          </button>

          {/* Chú giải trạng thái rút gọn */}
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5 text-xs">
            <span className="badge bg-success rounded-circle p-1"></span>
            Trống
          </span>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5 text-xs">
            <span className="badge bg-danger rounded-circle p-1"></span>
            Có khách
          </span>
          <span className="badge bg-info-subtle text-sky-800 border border-info-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5 text-xs">
            <span className="badge bg-info rounded-circle p-1"></span>
            Đã đặt
          </span>
        </div>
      </div>

      {/* Tabs Lọc Khu Vực */}
      <ThanhCuonNgang fadeColor="from-white" scrollStep={200}>
        {danhSachKhuVuc.map((khuVuc) => (
          <button
            key={khuVuc}
            onClick={(e) => {
              setKhuVucHienTai(khuVuc);
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className={`btn btn-sm rounded-pill fw-bold text-xs whitespace-nowrap transition-all ${
              khuVucHienTai === khuVuc
                ? 'btn-dark shadow-sm'
                : 'btn-outline-secondary bg-white text-slate-700'
            }`}
          >
            {khuVuc === 'all' ? 'Tất Cả Khu Vực' : khuVuc}
          </button>
        ))}
      </ThanhCuonNgang>

      {/* Lưới hiển thị các bàn ăn */}
      {dangTai ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div>Đang tải sơ đồ bàn...</div>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {banDaLoc.map((ban) => {
            const coKhach = ban.trang_thai === 'co_khach';
            const daDat = ban.trang_thai === 'da_dat';

            let cardBorder = 'border-slate-300 hover:border-blue-500';
            let badgeClass = 'badge bg-success-subtle text-success border border-success-subtle';
            let nhanTrangThai = 'Trống';

            if (coKhach) {
              cardBorder = 'border-red-400 bg-red-50/25 shadow-sm';
              badgeClass = 'badge bg-danger-subtle text-danger border border-danger-subtle';
              nhanTrangThai = 'Có Khách';
            } else if (daDat) {
              cardBorder = 'border-blue-400 bg-blue-50/25 shadow-sm';
              badgeClass = 'badge bg-primary-subtle text-primary border border-primary-subtle';
              nhanTrangThai = 'Đã Đặt';
            }

            return (
              <div key={ban.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <div
                  className={`card h-100 rounded-3xl p-5 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 d-flex flex-column justify-content-between border-2 ${cardBorder}`}
                >
                  {/* Phần đầu thẻ bàn */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white d-flex align-items-center justify-content-center font-black text-sm shadow-xs">
                          {ban.so_ban}
                        </div>
                        <span className={`px-3 py-1 rounded-pill text-xs fw-bold ${badgeClass}`}>
                          {nhanTrangThai}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-1.5 text-slate-600 text-xs font-black bg-slate-100 px-2.5 py-1 rounded-pill border border-slate-200/60">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ban.so_luong_khach || 0}/{ban.suc_chua}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 font-bold truncate mb-3">
                      <i className="bi bi-geo-alt me-1.5 text-blue-600"></i>{ban.khu_vuc}
                    </div>

                    {/* Thông tin tạm tính của bàn (Layer 2 tách lớp) */}
                    {coKhach && (
                      <div className="bg-slate-50/90 p-3.5 rounded-2xl border-2 border-slate-200/90 mb-3 space-y-1.5 shadow-2xs">
                        <div className="d-flex justify-content-between text-xs font-bold text-slate-600">
                          <span>Món đang dùng:</span>
                          <span className="text-slate-900 font-black">{ban.so_mon || 0} món</span>
                        </div>
                        <div className="d-flex justify-content-between text-xs font-bold text-slate-600">
                          <span>Tạm tính:</span>
                          <span className="text-black font-black text-sm tabular-nums">{dinhDangTienTe(ban.tam_tinh || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Các nút hành động thao tác bàn */}
                  <div className="space-y-2 pt-3 border-top border-slate-100">
                    <div className="row g-2">
                      {coKhach ? (
                        <>
                          <div className="col-6">
                            <button
                              onClick={() => moHoaDonBan(ban)}
                              className="btn btn-primary w-100 py-2.5 rounded-pill text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Tính Tiền</span>
                            </button>
                          </div>

                          <div className="col-6">
                            <button
                              onClick={() => {
                                if (setActiveTab) setActiveTab('pos');
                              }}
                              className="btn btn-light border w-100 py-2.5 rounded-pill text-slate-800 fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 cursor-pointer"
                            >
                              <Utensils className="w-3.5 h-3.5 text-red-600" />
                              <span>Gọi Thêm</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="col-12">
                          {/* NÚT MỞ BÀN CÙNG MÀU VỚI PANEL (TÁCH NỀN, TƯƠNG PHẢN TỐT) */}
                          <button
                            onClick={() => moPopupTiepDon(ban)}
                            className="btn bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border-2 border-slate-200/90 hover:border-blue-300 w-100 py-2.5 rounded-pill fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Mở Bàn Đón Khách</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nút xem mã QR của bàn */}
                    <button
                      onClick={() => {
                        setHuongDanQR(`Quét mã để đặt món & thanh toán Bàn ${ban.so_ban}`);
                        setBanXemQR(ban);
                      }}
                      className="btn btn-link text-slate-600 hover:text-blue-700 w-100 py-1 px-2 text-decoration-none text-xs fw-bold d-flex align-items-center justify-content-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mã QR Đặt Món</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TIẾP ĐÓN KHÁCH (CHỌN BÀN & SỐ LƯỢNG KHÁCH) */}
      {banMoTiepDon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">Tiếp Đón Khách</h3>
                <p className="text-xs text-slate-500 font-medium">Bàn {banMoTiepDon.so_ban} • {banMoTiepDon.khu_vuc}</p>
              </div>
              <button 
                onClick={() => setBanMoTiepDon(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lối tắt nếu khách đã đặt bàn trước */}
            <div className="bg-blue-50/70 border-2 border-blue-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-bold">Khách đã đặt bàn trước?</span>
              <button
                type="button"
                onClick={() => {
                  setBanMoTiepDon(null);
                  setHienTraCuuDatBan(true);
                }}
                className="text-blue-700 hover:text-blue-900 font-black underline cursor-pointer"
              >
                Tra cứu ngay
              </button>
            </div>

            {/* Chọn số lượng khách */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Số Lượng Khách Đến Bàn:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSoKhachDon(num)}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      soKhachDon === num
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num} người
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-500 mb-1 font-medium">Hoặc nhập số khách cụ thể:</div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={soKhachDon}
                  onChange={(e) => setSoKhachDon(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={xacNhanMoBanVaLayQR}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác Nhận & Hiển Thị Mã QR</span>
              </button>
              <button
                type="button"
                onClick={() => setBanMoTiepDon(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-full text-xs cursor-pointer transition-all"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRA CỨU KHÁCH ĐÃ ĐẶT BÀN & CHECK-IN NGAY */}
      {hienTraCuuDatBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Danh Sách Bàn Đã Đặt</h3>
                  <p className="text-xs text-slate-500 font-medium">Hỏi khách xem đã đặt bàn chưa để check-in</p>
                </div>
              </div>
              <button 
                onClick={() => setHienTraCuuDatBan(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ô tìm kiếm nhanh */}
            <div className="p-3 bg-white border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên khách, số điện thoại, hoặc số bàn..."
                  value={tuKhoaTraCuu}
                  onChange={(e) => setTuKhoaTraCuu(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-slate-200/90 rounded-full text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Danh sách các lịch hẹn */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
              {lichHenLoc.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  Không tìm thấy lịch đặt bàn nào phù hợp.
                </div>
              ) : (
                lichHenLoc.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl border-2 border-slate-200/90 hover:border-blue-400 bg-slate-50/70 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">{r.ten_khach}</span>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.sdt}
                        </span>
                        <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 text-xs">
                          Bàn {r.so_ban}
                        </span>
                        <span className="badge bg-slate-200 text-slate-700 rounded-pill px-2 py-0.5 text-xs">
                          {r.so_luong_khach} khách
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        Giờ hẹn: <span className="font-bold text-slate-700">{dinhDangNgayGio(r.thoi_gian_hen)}</span>
                      </div>

                      {/* GHI CHÚ ĐẶC BIỆT */}
                      {r.ghi_chu && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border-2 border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Ghi chú: {r.ghi_chu}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => xuLyCheckinLichDat(r)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Check-in Nhận Bàn</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thanh toán Hóa đơn */}
      {banThanhToan && (
        <ModalInHoaDon
          table={banThanhToan}
          orders={donMonThanhToan}
          onClose={() => setBanThanhToan(null)}
          onSuccess={() => {
            taiDanhSachBan();
          }}
        />
      )}

      {/* Popup Xem Mã QR Bàn Ăn */}
      {banXemQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="font-black text-lg text-slate-900">Mã QR Bàn {banXemQR.so_ban}</h3>
                <p className="text-xs text-slate-500 font-medium">{banXemQR.khu_vuc}</p>
              </div>
              <button 
                onClick={() => setBanXemQR(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner Hướng Dẫn Quét Mã Nổi Bật Cho Phục Vụ */}
            {huongDanQR && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-200/90 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{huongDanQR}</span>
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
                Khách dùng camera điện thoại quét để xem thực đơn & gọi món
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

// Bí danh tương thích
export const TableManagement = QuanLySoDoBan;
