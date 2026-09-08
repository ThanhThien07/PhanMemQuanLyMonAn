import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  LogOut, 
  ShieldCheck, 
  ChefHat, 
  UtensilsCrossed 
} from 'lucide-react';

export default function Navbar({ activeTab }) {
  const { user, logout } = useAuth();
  const { connected, latestNotification, clearNotification } = useSocket();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản Lý (Admin)', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck };
      case 'bep':
        return { label: 'Bếp Trưởng', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ChefHat };
      case 'nhan_vien':
      default:
        return { label: 'Thu Ngân / Phục Vụ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UtensilsCrossed };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Active Path */}
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Hệ Thống Quản Lý Nhà Hàng
        </h1>
        <span className="text-slate-300 text-sm hidden sm:inline">/</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hidden sm:inline-flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          {activeTab.toUpperCase()}
        </span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3.5">
        {/* Realtime Socket Status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          connected 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {connected ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
          <span className="hidden md:inline">{connected ? 'Socket Live' : 'Mất kết nối'}</span>
        </div>

        {/* Live Notification Popup */}
        {latestNotification && (
          <div 
            onClick={clearNotification}
            className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs cursor-pointer animate-bounce shadow-md shadow-amber-500/10"
            title="Bấm để đóng thông báo"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">{latestNotification.title}:</span>
            <span className="font-medium text-slate-700">{latestNotification.message}</span>
          </div>
        )}

        {/* User Info & Role */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800">{user?.name || 'Người dùng'}</div>
            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${roleInfo.color}`}>
              <RoleIcon className="w-3 h-3" />
              {roleInfo.label}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition-all cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
