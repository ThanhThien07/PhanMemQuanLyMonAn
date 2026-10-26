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
import { ExternalLink, Copy, Users, CreditCard, Utensils, CheckCircle, QrCode, X, CalendarCheck, Search, Sparkles, Phone, History, ReceiptText, Clock, Printer } from 'lucide-react';
import { useToast } from '../context/ThongBaoToastContext.jsx';
import { useSocket } from '../context/SocketRealtimeContext.jsx';
import { useNguoiDung } from '../context/NguoiDungContext.jsx';

export default function QuanLySoDoBan({ setActiveTab }) {
  const toast = useToast();
  const { socket } = useSocket();
  const { nguoiDung } = useNguoiDung();

  // Xác định vai trò đăng nhập
  const vaiTro = nguoiDung?.role || 'phuc_vu';
  const isAdmin = vaiTro === 'admin' || nguoiDung?.email?.toLowerCase().includes('admin');
  const isThuNgan = vaiTro === 'thu_ngan' || nguoiDung?.email?.toLowerCase().includes('thungan');
  const isPhucVu = vaiTro === 'phuc_vu' || vaiTro === 'nhan_vien' || nguoiDung?.email?.toLowerCase().includes('phucvu');

  const [danhSachBan, setDanhSachBan] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [banThanhToan, setBanThanhToan] = useState(null);
  const [donMonThanhToan, setDonMonThanhToan] = useState([]);
  const [banXemQR, setBanXemQR] = useState(null);
  const [huongDanQR, setHuongDanQR] = useState('');

  // Flow tiếp đón khách tại bàn
  const [banMoTiepDon, setBanMoTiepDon] = useState(null);
  const [soKhachDon, setSoKhachDon] = useState(2);

  // Xem chi tiết lịch sử bàn
  const [banXemLichSu, setBanXemLichSu] = useState(null);
  const [duLieuLichSuBan, setDuLieuLichSuBan] = useState(null);
  const [dangTaiLichSu, setDangTaiLichSu] = useState(false);

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
   * Mở modal xem chi tiết và lịch sử các đơn hàng của riêng bàn này
   */
  const moLichSuBan = async (ban) => {
    setBanXemLichSu(ban);
    setDangTaiLichSu(true);
    try {
      const phanHoi = await clientAxios.get(`/tables/${ban.id}/history`);
      if (phanHoi.success) {
        setDuLieuLichSuBan(phanHoi);
      }
    } catch (err) {
      toast.loi(err.message, 'Lỗi Tải Lịch Sử Bàn');
    } finally {
      setDangTaiLichSu(false);
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

  /**
   * In mã QR bàn ăn để dán lên bàn khi mã cũ bị mờ hoặc bị mất
   */
  const inMaQRBan = (ban) => {
    if (!ban) return;
    const printWin = window.open('', '_blank', 'width=650,height=750');
    if (!printWin) {
      alert('Trình duyệt đã chặn cửa sổ pop-up in. Vui lòng cho phép pop-up để in mã QR!');
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

  // Chuẩn hóa tên tầng/khu vực hiển thị to rõ phía trên số bàn
  const layTenTangTo = (khuVuc) => {
    if (!khuVuc) return 'Tầng 1';
    const kv = String(khuVuc).trim();
    if (kv.includes('VIP 1')) return 'Phòng VIP 1';
    if (kv.includes('VIP 2')) return 'Phòng VIP 2';
    if (/tầng\s*1/i.test(kv)) return 'Tầng 1';
    if (/tầng\s*2/i.test(kv)) return 'Tầng 2';
    if (/tầng\s*3/i.test(kv)) return 'Tầng 3';
    return kv.split('-')[0].split('(')[0].trim();
  };

  // Lấy danh sách ID các bàn đang hiển thị 'Đã Đặt' trên sơ đồ
  const tapHopBanDaDat = new Set(danhSachBan.filter((b) => b.trang_thai === 'da_dat').map((b) => b.id));

  // Danh sách lịch hẹn đã xác nhận hôm nay để tra cứu (đồng bộ chuẩn xác với trạng thái bàn đã đặt)
  const lichHenChuaDen = danhSachDatBan.filter((r) => 
    r.trang_thai === 'da_xac_nhan' && (!r.ban_id || tapHopBanDaDat.has(r.ban_id))
  );
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
            <span className="text-xs text-slate-500 font-semibold">{danhSachBan.length} bàn</span>
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
            className="bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border-2 border-blue-200/90 hover:border-blue-400 px-3 py-1.5 rounded-pill text-xs font-bold d-flex align-items-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
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

      {/* Lưới hiển thị các bàn ăn - Thu nhỏ gọn gàng, căn chỉnh tự nhiên */}
      {dangTai ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div>Đang tải sơ đồ bàn...</div>
        </div>
      ) : (
        <div className="row g-3 g-md-4 align-items-start">
          {danhSachBan.map((ban) => {
            const coKhach = ban.trang_thai === 'co_khach';
            const daDat = ban.trang_thai === 'da_dat';
            // Chỉ hiển thị khối món khi bàn thực sự có món đang dùng hoặc đã order
            const coMon = (Number(ban.so_mon) > 0) || (ban.danh_sach_mon && ban.danh_sach_mon.length > 0) || (Number(ban.tam_tinh) > 0);

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
                  className={`card rounded-3xl p-4 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${cardBorder}`}
                >
                  {/* Tên tầng to rõ đặt ở phía trên số bàn */}
                  <div className="text-base sm:text-lg font-black text-slate-800 tracking-tight mb-2.5">
                    {layTenTangTo(ban.khu_vuc)}
                  </div>

                  {/* Phần đầu thẻ bàn: Số bàn & Trạng thái & Số lượng khách */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white d-flex align-items-center justify-content-center font-black text-sm shadow-xs">
                        {ban.so_ban}
                      </div>
                      <span className={`px-3 py-1 rounded-pill text-xs fw-bold ${badgeClass}`}>
                        {nhanTrangThai}
                      </span>
                    </div>

                    {/* CHỈ HIỂN THỊ SỐ LƯỢNG KHÁCH KHI BÀN CÓ KHÁCH (BÀN TRỐNG KHÔNG HIỆN) */}
                    {coKhach ? (
                      <div className="d-flex align-items-center gap-1.5 text-blue-900 text-xs font-black bg-blue-50 px-2.5 py-1 rounded-pill border-2 border-blue-200/90 shadow-2xs">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ban.so_luong_khach || 1} khách</span>
                      </div>
                    ) : daDat ? (
                      <div className="d-flex align-items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-pill border border-slate-200">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{ban.suc_chua} chỗ</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Thông tin tạm tính & danh sách món: CHỈ HIỂN THỊ KHI CÓ MÓN ĂN THỰC SỰ */}
                  {coMon && (
                    <div className="bg-slate-50/90 p-3 rounded-2xl border-2 border-slate-200/90 mb-3 space-y-2 shadow-2xs">
                      {ban.danh_sach_mon && ban.danh_sach_mon.length > 0 ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200/70">
                            <span className="d-flex align-items-center gap-1">
                              <Utensils className="w-3.5 h-3.5 text-blue-600" />
                              <span>Món đang phục vụ:</span>
                            </span>
                            <span className="badge bg-blue-100 text-blue-900 rounded-pill px-2 py-0.5 text-[11px] font-black">
                              {ban.danh_sach_mon.length} món
                            </span>
                          </div>
                          <div className="max-h-24 overflow-y-auto space-y-1 pt-1.5 pe-1">
                            {ban.danh_sach_mon.map((m, idx) => (
                              <div key={idx} className="d-flex align-items-center justify-content-between text-[11px] text-slate-800 py-0.5">
                                <span className="truncate max-w-[150px] font-medium" title={m.ten_mon}>• {m.ten_mon}</span>
                                <span className="font-black text-slate-900 shrink-0">x{m.so_luong}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-between text-xs font-bold text-slate-600">
                          <span>Món đang dùng:</span>
                          <span className="text-slate-900 font-black">{ban.so_mon} món</span>
                        </div>
                      )}

                      {/* Tổng tạm tính */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-t border-slate-200/80 text-xs font-bold text-slate-700">
                        <span>Tạm tính:</span>
                        <span className="text-slate-900 font-black text-sm tabular-nums whitespace-nowrap">
                          {dinhDangTienTe(ban.tam_tinh || 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Các nút hành động thao tác bàn phân quyền rõ ràng */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    {isAdmin ? (
                      /* VAI TRÒ ADMIN: Chỉ xem trạng thái, danh sách món và Chi Tiết Lịch Sử Bàn. KHÔNG hiện nút Tính Tiền / Mở Bàn / Gọi Thêm */
                      <div className="space-y-1.5 text-center">
                        <button
                          onClick={() => moLichSuBan(ban)}
                          className="btn bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border-2 border-slate-200/90 hover:border-blue-300 w-100 py-2 rounded-pill fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                        >
                          <ReceiptText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Chi Tiết & Lịch Sử Bàn</span>
                        </button>

                        <button
                          onClick={() => {
                            setHuongDanQR(`Quét mã để đặt món & thanh toán Bàn ${ban.so_ban}`);
                            setBanXemQR(ban);
                          }}
                          className="btn btn-link text-blue-600 hover:text-blue-800 w-100 py-1.5 px-2 text-decoration-none text-xs font-black d-flex align-items-center justify-content-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Mã QR Đặt Món</span>
                        </button>
                      </div>
                    ) : isThuNgan ? (
                      /* VAI TRÒ THU NGÂN: Nút Tính Tiền khi có khách -> tự động giải phóng bàn */
                      <div className="space-y-1.5">
                        {coKhach ? (
                          <button
                            onClick={() => moHoaDonBan(ban)}
                            className="btn btn-primary w-100 py-2 rounded-pill text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Tính Tiền Hóa Đơn</span>
                          </button>
                        ) : (
                          <div className="text-center py-1.5 text-slate-400 text-xs font-semibold">
                            Bàn đang trống sẵn sàng
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setHuongDanQR(`Quét mã để đặt món & thanh toán Bàn ${ban.so_ban}`);
                            setBanXemQR(ban);
                          }}
                          className="btn btn-link text-blue-600 hover:text-blue-800 w-100 py-1 px-2 text-decoration-none text-xs font-black d-flex align-items-center justify-content-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Mã QR Đặt Món</span>
                        </button>
                      </div>
                    ) : (
                      /* VAI TRÒ PHỤC VỤ (Waiter): Tiếp đón khách, mở bàn chọn số khách, gọi thêm */
                      <div className="space-y-1.5">
                        <div className="row g-2">
                          {coKhach ? (
                            <div className="col-12">
                              <button
                                onClick={() => {
                                  if (setActiveTab) setActiveTab('pos');
                                }}
                                className="btn btn-light border-2 border-slate-200 hover:border-blue-300 w-100 py-2 rounded-pill text-slate-800 fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <Utensils className="w-3.5 h-3.5 text-red-600" />
                                <span>Gọi Thêm Món</span>
                              </button>
                            </div>
                          ) : (
                            <div className="col-12">
                              <button
                                onClick={() => moPopupTiepDon(ban)}
                                className="btn bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border-2 border-slate-200/90 hover:border-blue-300 w-100 py-2 rounded-pill fw-bold text-xs d-flex align-items-center justify-content-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>Đón Khách Tại Bàn</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setHuongDanQR(`Quét mã để đặt món & thanh toán Bàn ${ban.so_ban}`);
                            setBanXemQR(ban);
                          }}
                          className="btn btn-link text-blue-600 hover:text-blue-800 w-100 py-1 px-2 text-decoration-none text-xs font-black d-flex align-items-center justify-content-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Mã QR Đặt Món</span>
                        </button>
                      </div>
                    )}
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

            {/* Nhập số lượng khách cụ thể */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Số Lượng Khách Đến Bàn:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={soKhachDon}
                onChange={(e) => setSoKhachDon(Math.max(1, Number(e.target.value)))}
                placeholder="Nhập số lượng khách (ví dụ: 4)"
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200/90 rounded-2xl text-base font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 font-medium">Nhập số khách thực tế để hệ thống sắp xếp bàn phù hợp.</p>
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

      {/* Popup Xem & In Mã QR Bàn Ăn */}
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

            {/* Banner Hướng Dẫn Quét Mã Nổi Bật Cho Phục Vụ */}
            {huongDanQR && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-tight">{huongDanQR}</span>
              </div>
            )}

            {/* Khung ảnh QR Code */}
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
                Khách dùng camera điện thoại quét để xem thực đơn & gọi món
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

      {/* MODAL CHI TIẾT & LỊCH SỬ PHỤC VỤ CỦA BÀN ĂN (DÀNH CHO ADMIN) */}
      {banXemLichSu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header Modal */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {banXemLichSu.so_ban}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-0">
                    Chi Tiết & Lịch Sử Bàn {banXemLichSu.so_ban}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-0">
                    {banXemLichSu.khu_vuc} • Sức chứa {banXemLichSu.suc_chua} khách
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBanXemLichSu(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung thống kê & Lịch sử */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Chỉ số nhanh của bàn */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-50/90 p-3 rounded-2xl border-2 border-slate-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Trạng Thái Hiện Tại</div>
                  <div className="text-sm font-black text-slate-900 mt-1 capitalize">
                    {banXemLichSu.trang_thai === 'co_khach' ? 'Đang Có Khách' : banXemLichSu.trang_thai === 'da_dat' ? 'Đã Đặt Trước' : 'Đang Trống'}
                  </div>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border-2 border-slate-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Lượt Phục Vụ</div>
                  <div className="text-sm font-black text-blue-600 mt-1 tabular-nums">
                    {duLieuLichSuBan?.soLuotGoi || 0} lượt món
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-50/90 p-3 rounded-2xl border-2 border-slate-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Tiền Đã Bán</div>
                  <div className="text-sm font-black text-emerald-600 mt-1 tabular-nums whitespace-nowrap">
                    {dinhDangTienTe(duLieuLichSuBan?.tongTienDaBan || 0)}
                  </div>
                </div>
              </div>

              {/* Bảng danh sách các lần gọi món & lịch sử phục vụ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-600" />
                    <span>Lịch Sử Các Món Đã Đặt Tại Bàn</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-bold">
                    {duLieuLichSuBan?.history?.length || 0} đơn
                  </span>
                </div>

                {dangTaiLichSu ? (
                  <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                    <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                    <div>Đang tải lịch sử bàn...</div>
                  </div>
                ) : !duLieuLichSuBan?.history || duLieuLichSuBan.history.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-2xl border-2 border-slate-200/90">
                    Bàn này chưa phát sinh lịch sử gọi món nào.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {duLieuLichSuBan.history.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-2xl bg-slate-50/90 border-2 border-slate-200/90 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-circle bg-white border border-slate-200 font-bold text-slate-500 flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-black text-slate-900 text-sm">{item.ten_mon}</div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-2 flex-wrap mt-0.5">
                              <span>Số lượng: <b className="text-slate-800">x{item.so_luong}</b></span>
                              <span>•</span>
                              <span>Đơn giá: {dinhDangTienTe(item.don_gia)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {dinhDangNgayGio(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-slate-900 tabular-nums">
                            {dinhDangTienTe(item.tong_tien)}
                          </div>
                          <span className={`badge rounded-pill px-2 py-0.5 text-[10px] font-bold ${
                            item.phuong_thuc_thanh_toan === 'chua_thanh_toan'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {item.phuong_thuc_thanh_toan === 'chua_thanh_toan' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setBanXemLichSu(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-full text-xs transition-all cursor-pointer"
              >
                Đóng
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
