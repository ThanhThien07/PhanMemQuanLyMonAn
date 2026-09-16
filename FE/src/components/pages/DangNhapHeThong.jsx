/**
 * @file DangNhapHeThong.jsx
 * @description Màn hình Đăng nhập hệ thống Quản lý Nhà hàng Royal Bistro POS.
 * Cung cấp:
 * 1. Form đăng nhập tiêu chuẩn bằng Email và Mật khẩu.
 * 2. Tính năng 1-Click Demo Login cho 3 vai trò: Admin (Quản lý), Thu Ngân, Bếp Trưởng.
 * 3. Lối tắt chuyển nhanh sang chế độ Khách quét mã QR tự gọi món tại bàn (?table=1).
 * @module pages/DangNhapHeThong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import { useAuth } from '../context/NguoiDungContext.jsx';
import { Flame, ShieldCheck, ChefHat, UtensilsCrossed, ArrowRight, Lock, Mail, QrCode } from 'lucide-react';

export default function DangNhapHeThong() {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  /**
   * Xử lý gửi form đăng nhập
   */
  const xuLyDangNhap = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      await login(email, password);
    } catch (err) {
      setThongBaoLoi(err.message || 'Đăng nhập không thành công.');
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Xử lý đăng nhập nhanh 1-Click cho tài khoản mẫu
   */
  const xuLyDangNhapNhanh = async (demoEmail) => {
    setThongBaoLoi('');
    setDangXuLy(true);
    try {
      await quickLoginAs(demoEmail);
    } catch (err) {
      setThongBaoLoi(err.message);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Khối Thương Hiệu */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] items-center justify-center shadow-xl shadow-blue-500/20 mb-4 transform hover:scale-105 transition-transform">
            <Flame className="w-9 h-9 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-wider uppercase bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">
            ROYAL BISTRO POS
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1.5">
            Hệ Thống Quản Lý Nhà Hàng & Đặt Món Thông Minh
          </p>
        </div>

        {/* Khung Form Đăng Nhập */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Đăng Nhập Hệ Thống</h3>

          {thongBaoLoi && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {thongBaoLoi}
            </div>
          )}

          <form onSubmit={xuLyDangNhap} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Email Đăng Nhập
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nhahang.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0077B6] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0077B6] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#03045E] hover:to-[#023E8A] text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {dangXuLy ? 'Đang xử lý...' : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Khối Đăng nhập nhanh 1-Click phục vụ kiểm thử */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              ⚡ Đăng Nhập Nhanh 1-Click (Demo)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => xuLyDangNhapNhanh('admin@nhahang.com')}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => xuLyDangNhapNhanh('thungan@nhahang.com')}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold">Thu Ngân</span>
              </button>

              <button
                type="button"
                onClick={() => xuLyDangNhapNhanh('bep@nhahang.com')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-bold">Bếp Trưởng</span>
              </button>
            </div>

            {/* Nút dành cho khách quét mã đặt món */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <a
                href="/?table=1"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 text-amber-900 font-black text-xs hover:bg-amber-200 transition-all shadow-xs"
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>📱 Khách Ăn Tại Bàn? Quét Mã / Đặt Món Ngay</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs font-semibold text-slate-400">
          Royal Bistro POS • Professional Restaurant Management System
        </div>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const Login = DangNhapHeThong;
