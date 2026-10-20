/**
 * @file ThongBaoToastContext.jsx
 * @description React Context quản lý hiển thị các thông báo nhanh (Toast Notification Alerts):
 * Quy chuẩn:
 * 1. Tự động biến mất sau đúng 3 giây (3000ms).
 * 2. Hiển thị tối đa 5 thông báo trên màn hình cùng một lúc (MAX_TOASTS = 5).
 * 3. Hàng đợi FIFO: Khi đã có 5 thông báo mà có thêm thông báo mới, thông báo cũ nhất sẽ tự động bị xóa để nhường chỗ cho cái mới nhất.
 * 4. Tích hợp âm thanh chuông reo báo phục vụ (Web Audio API Synthesizer) không cần tệp ngoài.
 * @module context/ThongBaoToastContext
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Bell, CreditCard, ChefHat } from 'lucide-react';

const ThongBaoToastContext = createContext(null);
const GIOI_HAN_TOAST_TOI_DA = 5;
const THOI_LUONG_MAC_DINH_MS = 3000; // Đúng 3 giây theo yêu cầu

/**
 * Phát âm thanh chuông thông báo nhẹ nhàng bằng Web Audio API
 */
function phatAmThanhChuong(loai = 'default') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (loai === 'call_waiter' || loai === 'warning') {
      // Chuông 2 hồi cao vang dội (Ding-Dong phục vụ)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (loai === 'success') {
      // Âm thanh thành công ngân nga
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else {
      // Âm thanh thông báo bình thường
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Trình duyệt có thể chặn autoplay âm thanh khi chưa tương tác
  }
}

export function BoCungCapThongBao({ children }) {
  const [danhSachThongBao, setDanhSachThongBao] = useState([]);
  const timersRef = useRef({});

  /**
   * Xóa một thông báo theo ID
   */
  const xoaThongBao = useCallback((maId) => {
    if (timersRef.current[maId]) {
      clearTimeout(timersRef.current[maId]);
      delete timersRef.current[maId];
    }
    setDanhSachThongBao((truoc) => truoc.filter((t) => t.id !== maId));
  }, []);

  /**
   * Thêm thông báo mới:
   * - Tự tắt sau 5s (5000ms).
   * - Tối đa 5 thông báo.
   * - Nếu >= 5, xóa cái cũ nhất để nhường chỗ cho cái mới nhất.
   */
  const themThongBao = useCallback(
    (noiDung, loai = 'info', tieuDe = null, thoiLuong = THOI_LUONG_MAC_DINH_MS) => {
      const maId = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const gioTao = new Date().toLocaleTimeString('vi-VN');

      // Phát âm thanh
      phatAmThanhChuong(loai);

      setDanhSachThongBao((truoc) => {
        // Nếu đã đủ hoặc vượt quá 5 thông báo, cắt bỏ các phần tử cũ nhất ở đầu
        const danhSachSauCat = truoc.length >= GIOI_HAN_TOAST_TOI_DA
          ? truoc.slice(truoc.length - (GIOI_HAN_TOAST_TOI_DA - 1))
          : [...truoc];

        return [
          ...danhSachSauCat,
          {
            id: maId,
            message: noiDung,
            title: tieuDe,
            type: loai,
            time: gioTao,
            duration: thoiLuong
          }
        ];
      });

      // Tự động biến mất sau đúng thời lượng quy định (5s)
      if (thoiLuong > 0) {
        timersRef.current[maId] = setTimeout(() => {
          xoaThongBao(maId);
        }, thoiLuong);
      }

      return maId;
    },
    [xoaThongBao]
  );

  const toast = {
    thanhCong: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'success', title, dur),
    loi: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'error', title, dur),
    canhBao: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'warning', title, dur),
    thongTin: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'info', title, dur),
    goiPhucVu: (msg, title = 'Chuông Gọi Phục Vụ', dur = THOI_LUONG_MAC_DINH_MS) =>
      themThongBao(msg, 'call_waiter', title, dur),
    thanhToan: (msg, title = 'Yêu Cầu Thanh Toán', dur = THOI_LUONG_MAC_DINH_MS) =>
      themThongBao(msg, 'payment', title, dur),

    // Bí danh tiếng Anh tương thích ngược
    success: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'success', title, dur),
    error: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'error', title, dur),
    warning: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'warning', title, dur),
    info: (msg, title, dur = THOI_LUONG_MAC_DINH_MS) => themThongBao(msg, 'info', title, dur)
  };

  const layBieuTuongToast = (loai) => {
    switch (loai) {
      case 'call_waiter':
        return <Bell className="w-5 h-5 text-amber-500 animate-bounce shrink-0" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-sky-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'kitchen':
        return <ChefHat className="w-5 h-5 text-indigo-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-500 shrink-0" />;
    }
  };

  const layKieuCard = (loai) => {
    switch (loai) {
      case 'call_waiter':
        return 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/60 text-amber-900 dark:text-amber-100 shadow-amber-500/20';
      case 'payment':
        return 'bg-gradient-to-r from-sky-500/15 to-blue-500/10 border-sky-500/60 text-sky-900 dark:text-sky-100 shadow-sky-500/20';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-emerald-500/60 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/20';
      case 'error':
        return 'bg-gradient-to-r from-rose-500/15 to-red-500/10 border-rose-500/60 text-rose-900 dark:text-rose-100 shadow-rose-500/20';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-amber-500/60 text-amber-900 dark:text-amber-100 shadow-amber-500/20';
      default:
        return 'bg-gradient-to-r from-slate-500/15 to-slate-600/10 border-slate-400/60 text-slate-900 dark:text-slate-100 shadow-slate-500/20';
    }
  };

  return (
    <ThongBaoToastContext.Provider value={{ toast, danhSachThongBao, xoaThongBao }}>
      {children}

      {/* Khung hiển thị xếp chồng thông báo góc trên phải / dưới phải (Tối đa 5 mục) */}
      <div 
        className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 w-full max-w-sm pointer-events-none"
        aria-live="polite"
        role="region"
        aria-label="Thông báo hệ thống"
      >
        {danhSachThongBao.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-xl p-3.5 transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in-right ${layKieuCard(
              t.type
            )} bg-white/95 text-slate-800`}
          >
            {/* Thanh tiến trình đếm ngược 5 giây */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-shrink-width"
              style={{ animationDuration: `${t.duration || THOI_LUONG_MAC_DINH_MS}ms` }}
            />

            <div className="flex items-start gap-3">
              <div className="mt-0.5">{layBieuTuongToast(t.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 truncate">
                    {t.title || (t.type === 'call_waiter' ? '🔔 GỌI PHỤC VỤ' : 'THÔNG BÁO')}
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                    {t.time}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-snug mt-0.5 break-words">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => xoaThongBao(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ThongBaoToastContext.Provider>
  );
}

/**
 * Hook sử dụng Toast
 */
export function suDungToast() {
  const toastCtx = useContext(ThongBaoToastContext);
  if (!toastCtx) throw new Error('suDungToast phải được sử dụng bên trong BoCungCapThongBao');
  return toastCtx.toast;
}

export const ToastProvider = BoCungCapThongBao;
export const ThongBaoToastProvider = BoCungCapThongBao;
export const useToast = suDungToast;
export const useThongBaoToast = suDungToast;

export default ThongBaoToastContext;
