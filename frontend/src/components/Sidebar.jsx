import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Grid3X3, 
  ChefHat, 
  CalendarClock, 
  Utensils, 
  Boxes, 
  Users, 
  BarChart3,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const role = user?.role || 'nhan_vien';

  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, roles: ['admin', 'nhan_vien', 'bep'] },
    { id: 'pos', label: 'POS Gọi Món', icon: ShoppingBag, roles: ['admin', 'nhan_vien'] },
    { id: 'tables', label: 'Sơ Đồ Bàn', icon: Grid3X3, roles: ['admin', 'nhan_vien'] },
    { id: 'kitchen', label: 'Màn Hình Bếp', icon: ChefHat, badge: 'Live', roles: ['admin', 'bep', 'nhan_vien'] },
    { id: 'reservations', label: 'Đặt Bàn Trước', icon: CalendarClock, roles: ['admin', 'nhan_vien'] },
    { id: 'dishes', label: 'Thực Đơn Món', icon: Utensils, roles: ['admin', 'bep'] },
    { id: 'inventory', label: 'Kho & Định Lượng', icon: Boxes, roles: ['admin', 'bep'] },
    { id: 'customers', label: 'Khách Hàng', icon: Users, roles: ['admin', 'nhan_vien'] },
    { id: 'reports', label: 'Báo Cáo Doanh Thu', icon: BarChart3, roles: ['admin'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 bg-clip-text text-transparent truncate leading-tight">
              ROYAL BISTRO
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Restaurant POS
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
        <div className="text-[11px] font-semibold text-slate-600">
          Chuyên Đề BE (Node.js) & FE (React.js)
        </div>
        <div className="text-[10px] text-amber-700 font-mono font-bold mt-0.5">
          REST API + Socket.io Active
        </div>
      </div>
    </aside>
  );
}
