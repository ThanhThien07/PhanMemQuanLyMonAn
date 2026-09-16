/**
 * @file ThongBaoToastContext.jsx
 * @description React Context quản lý hiển thị các thông báo nhanh (Toast Notification Alerts):
 * Thành công (success), Thất bại (error), Cảnh báo (warning), Thông tin (info).
 * Tự động tắt sau khoảng thời gian đếm ngược (duration ms) hoặc người dùng có thể chủ động bấm nút đóng.
 * @module context/ThongBaoToastContext
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ThongBaoToastContext = createContext(null);

export function BoCungCapThongBao({ children }) {
  const [danhSachThongBao, setDanhSachThongBao] = useState([]);

  const themThongBao = useCallback((noiDung, loai = 'success', thoiLuong = 3000) => {
    const maId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setDanhSachThongBao((truoc) => [...truoc, { id: maId, message: noiDung, type: loai }]);

    if (thoiLuong > 0) {
      setTimeout(() => {
        xoaThongBao(maId);
      }, thoiLuong);
    }
  }, []);

  const xoaThongBao = useCallback((maId) => {
    setDanhSachThongBao((truoc) => truoc.filter((t) => t.id !== maId));
  }, []);

  const toast = {
    thanhCong: (msg, dur) => themThongBao(msg, 'success', dur),
    loi: (msg, dur) => themThongBao(msg, 'error', dur),
    thongTin: (msg, dur) => themThongBao(msg, 'info', dur),
    canhBao: (msg, dur) => themThongBao(msg, 'warning', dur),
    // Bí danh tương thích
    success: (msg, dur) => themThongBao(msg, 'success', dur),
    error: (msg, dur) => themThongBao(msg, 'error', dur),
    info: (msg, dur) => themThongBao(msg, 'info', dur),
    warning: (msg, dur) => themThongBao(msg, 'warning', dur)
  };

  const layBieuTuongToast = (loai) => {
    switch (loai) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const layMauSacToast = (loai) => {
    switch (loai) {
      case 'success':
        return 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10';
      case 'error':
        return 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10';
      case 'warning':
        return 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-500/10';
      default:
        return 'bg-slate-900/95 border-sky-500/40 text-sky-300 shadow-sky-500/10';
    }
  };

  return (
    <ThongBaoToastContext.Provider value={{ toast }}>
      {children}
      {/* Khung hiển thị thông báo góc dưới phải màn hình */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {danhSachThongBao.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-up ${layMauSacToast(
              t.type
            )}`}
          >
            <div className="flex items-center gap-2.5">
              {layBieuTuongToast(t.type)}
              <span className="text-xs font-semibold leading-relaxed">{t.message}</span>
            </div>
            <button
              onClick={() => xoaThongBao(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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

// Bí danh tương thích
export const ToastProvider = BoCungCapThongBao;
export const ThongBaoToastProvider = BoCungCapThongBao;
export const useToast = suDungToast;
export const useThongBaoToast = suDungToast;

export default ThongBaoToastContext;
