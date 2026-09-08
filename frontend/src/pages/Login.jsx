import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, ShieldCheck, ChefHat, UtensilsCrossed, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs(demoEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing soft orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 items-center justify-center shadow-xl shadow-amber-500/25 mb-4 transform hover:scale-105 transition-transform">
            <Flame className="w-9 h-9 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-wider uppercase bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 bg-clip-text text-transparent">
            ROYAL BISTRO POS
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1.5">
            Hệ Thống Quản Lý Nhà Hàng & Đặt Món Thông Minh
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Đăng Nhập Hệ Thống</h3>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nhahang.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              ⚡ Đăng Nhập Nhanh 1-Click (Demo)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nhahang.com')}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('thungan@nhahang.com')}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold">Thu Ngân</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bep@nhahang.com')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-bold">Bếp Trưởng</span>
              </button>
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
