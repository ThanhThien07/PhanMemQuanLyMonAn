/**
 * @file ManHinhBepKDS.jsx
 * @description Màn hình Hệ thống Bếp Trưởng (Kitchen Display System - KDS).
 * Nhận đơn gọi món theo thời gian thực (Realtime WebSockets), thông báo chuông âm thanh khi có món mới,
 * cho phép chuyển trạng thái 'Đang chế biến' (tự động trừ kho nguyên liệu theo định lượng BOM) và 'Nấu xong & Báo phục vụ'.
 * @module pages/ManHinhBepKDS
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { useSocketRealtime } from '../context/SocketRealtimeContext';

/**
 * Component Màn hình Bếp KDS
 */
export default function ManHinhBepKDS() {
  // Danh sách các món ăn đang chờ bếp hoặc đang chế biến
  const [danhSachMonBep, setDanhSachMonBep] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Kết nối socket thời gian thực
  const { socket } = useSocketRealtime();

  /**
   * Tải danh sách đơn món cần chế biến từ máy chủ
   */
  const taiDanhSachMonBep = async () => {
    try {
      setDangTai(true);
      const res = await axiosApi.get('/orders/kitchen');
      if (res.success) {
        setDanhSachMonBep(res.orders);
      }
    } catch (loi) {
      console.error('Lỗi khi tải danh sách món bếp:', loi);
    } finally {
      setDangTai(false);
    }
  };

  /**
   * Phát âm thanh thông báo bip khi có đơn món mới được gửi đến bếp
   */
  const phatChuongThongBao = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Lỗi âm thanh thông báo:', e);
    }
  };

  useEffect(() => {
    taiDanhSachMonBep();

    // Lắng nghe sự kiện socket thời gian thực
    if (socket) {
      const xuLyDonMoi = (donMoi) => {
        setDanhSachMonBep((prev) => [donMoi, ...prev]);
        phatChuongThongBao();
      };

      const xuLyCapNhatTrangThai = (donCapNhat) => {
        setDanhSachMonBep((prev) => {
          if (
            donCapNhat.trang_thai === 'da_phuc_vu' ||
            donCapNhat.trang_thai === 'hoan_thanh' ||
            donCapNhat.trang_thai === 'da_huy'
          ) {
            return prev.filter((o) => o.id !== donCapNhat.id);
          }
          return prev.map((o) => (o.id === donCapNhat.id ? { ...o, ...donCapNhat } : o));
        });
      };

      socket.on('order:new', xuLyDonMoi);
      socket.on('order:status_updated', xuLyCapNhatTrangThai);

      return () => {
        socket.off('order:new', xuLyDonMoi);
        socket.off('order:status_updated', xuLyCapNhatTrangThai);
      };
    }
  }, [socket]);

  /**
   * Cập nhật trạng thái chế biến của món ăn
   * @param {string|number} donId - ID món trong đơn
   * @param {string} trangThaiMoi - 'dang_che_bien' hoặc 'da_phuc_vu'
   */
  const capNhatTrangThai = async (donId, trangThaiMoi) => {
    try {
      const res = await axiosApi.patch(`/orders/${donId}/status`, {
        trang_thai: trangThaiMoi
      });
      if (res.success) {
        if (trangThaiMoi === 'da_phuc_vu') {
          setDanhSachMonBep((prev) => prev.filter((o) => o.id !== donId));
        } else {
          setDanhSachMonBep((prev) =>
            prev.map((o) => (o.id === donId ? { ...o, trang_thai: trangThaiMoi } : o))
          );
        }
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi cập nhật trạng thái chế biến');
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Trạng thái hoạt động */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="w-12 h-12 rounded-3 bg-amber-50 text-amber-700 border border-amber-200 d-flex align-items-center justify-content-center shadow-xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger text-white rounded-pill px-2.5 py-1 text-xs fw-bold">
                <i className="bi bi-broadcast me-1"></i>Realtime KDS
              </span>
              <span className="text-xs text-slate-500 font-semibold">Tự động trừ kho theo BOM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0">
              Màn Hình Bếp Trưởng (Kitchen Display System)
            </h2>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2.5">
          <button
            onClick={taiDanhSachMonBep}
            className="btn btn-sm btn-outline-secondary bg-white text-slate-800 fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dangTai ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <span className="badge bg-warning-subtle text-amber-900 border border-warning-subtle px-3 py-2 rounded-pill fw-bold text-xs">
            <i className="bi bi-hourglass-split me-1"></i>Đang Chờ: {danhSachMonBep.length} món
          </span>
        </div>
      </div>

      {/* Lưới danh sách các món cần chế biến */}
      {danhSachMonBep.length === 0 ? (
        <div className="p-5 rounded-4 bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-sm my-4">
          <div className="w-16 h-16 rounded-3 bg-emerald-50 text-emerald-600 d-flex align-items-center justify-content-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Tất Cả Món Đã Được Phục Vụ!</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mb-0">
            Hiện tại không có đơn món nào đang chờ chế biến. Bếp có thể nghỉ ngơi hoặc chuẩn bị sơ chế nguyên liệu.
          </p>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {danhSachMonBep.map((mon) => {
            const dangNau = mon.trang_thai === 'dang_che_bien';

            return (
              <div key={mon.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className={`card h-100 rounded-4 p-4 border transition-all duration-300 d-flex flex-column justify-content-between shadow-sm ${
                    dangNau
                      ? 'bg-sky-50/70 border-sky-300 shadow-sky-500/10'
                      : 'bg-white border-amber-300 shadow-amber-500/10'
                  }`}
                >
                  <div>
                    {/* Thông tin số bàn & Trạng thái */}
                    <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-slate-200/80">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning text-dark font-black fs-6 px-2.5 py-1.5 rounded-3 shadow-xs">
                          B{mon.so_ban}
                        </span>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">Bàn {mon.so_ban}</div>
                          <div className="text-2xs text-slate-500 font-medium">{mon.khu_vuc}</div>
                        </div>
                      </div>

                      <span
                        className={`badge rounded-pill px-2.5 py-1 text-xs fw-bold ${
                          dangNau
                            ? 'bg-info-subtle text-sky-900 border border-info-subtle'
                            : 'bg-warning-subtle text-amber-900 border border-warning-subtle animate-pulse'
                        }`}
                      >
                        {dangNau ? '🔥 Đang Nấu' : '⏳ Chờ Nấu'}
                      </span>
                    </div>

                    {/* Chi tiết món ăn */}
                    <div className="py-3">
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <h4 className="text-base font-black text-slate-900 mb-1 leading-snug">
                          {mon.ten_mon}
                        </h4>
                        <span className="badge bg-slate-900 text-white font-black fs-6 px-2.5 py-1 rounded-3 shrink-0">
                          x{mon.so_luong}
                        </span>
                      </div>

                      {/* Ghi chú của khách hoặc thu ngân */}
                      {mon.ghi_chu && (
                        <div className="mt-2 p-2 rounded-3 bg-amber-100/60 border border-amber-200 text-amber-950 text-xs font-bold d-flex align-items-start gap-1.5">
                          <span className="shrink-0 text-amber-700">📌 Ghi chú:</span>
                          <span>{mon.ghi_chu}</span>
                        </div>
                      )}

                      {/* Thời gian nhận đơn */}
                      <div className="text-2xs text-slate-400 font-medium mt-2 d-flex align-items-center gap-1">
                        <i className="bi bi-clock"></i>
                        <span>
                          Nhận lúc:{' '}
                          {new Date(mon.thoi_gian_dat || Date.now()).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút bấm chuyển trạng thái */}
                  <div className="pt-3 border-top border-slate-200/80">
                    {dangNau ? (
                      <button
                        onClick={() => capNhatTrangThai(mon.id, 'da_phuc_vu')}
                        className="btn btn-success w-100 py-2.5 rounded-3 text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Nấu Xong & Báo Phục Vụ</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => capNhatTrangThai(mon.id, 'dang_che_bien')}
                        className="btn btn-primary w-100 py-2.5 rounded-3 text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-2 shadow-sm"
                      >
                        <Flame className="w-4 h-4 text-warning" />
                        <span>Bắt Đầu Nấu (Trừ Kho BOM)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
