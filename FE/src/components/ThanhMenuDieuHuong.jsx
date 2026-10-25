/**
 * @file ThanhMenuDieuHuong.jsx
 * @description Thanh menu điều hướng bên hông (Sidebar Navigation).
 * Chứa danh sách các liên kết phân hệ chức năng:
 * - Tổng Quan (Dashboard)
 * - POS Bán Hàng Gọi Món (POS Order)
 * - Sơ Đồ Bàn Ăn (Table Map)
 * - Màn Hình Bếp KDS (Kitchen Display System)
 * - Khách Quét QR Bàn (Customer QR Order)
 * - Đặt Bàn Trước (Reservations)
 * - Quản Lý Thực Đơn (Dishes & Menu)
 * - Quản Lý Kho & Định Lượng BOM (Inventory)
 * - Khách Hàng Thân Thiết CRM (Customers)
 * - Báo Cáo Doanh Thu (Reports)
 * Tự động ẩn hiện các mục menu theo quyền hạn (roles) của tài khoản đang đăng nhập.
 * @module components/ThanhMenuDieuHuong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

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
  Flame,
  QrCode,
  X
} from 'lucide-react';
import { useAuth } from './context/NguoiDungContext.jsx';

export default function ThanhMenuDieuHuong({ activeTab, setActiveTab, sidebarMo, dongSidebar }) {
  const { user } = useAuth();
  const vaiTro = user?.role || 'nhan_vien';

  const danhSachMenu = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, roles: ['admin', 'nhan_vien', 'bep'] },
    { id: 'pos', label: 'POS Gọi Món', icon: ShoppingBag, roles: ['admin', 'nhan_vien'] },
    { id: 'tables', label: 'Sơ Đồ Bàn', icon: Grid3X3, roles: ['admin', 'nhan_vien'] },
    { id: 'kitchen', label: 'Màn Hình Bếp', icon: ChefHat, badge: 'Live', roles: ['admin', 'bep', 'nhan_vien'] },
    { id: 'qr_order', label: 'Khách Quét QR Bàn', icon: QrCode, badge: 'Khách', roles: ['admin', 'nhan_vien', 'bep'] },
    { id: 'reservations', label: 'Đặt Bàn Trước', icon: CalendarClock, roles: ['admin', 'nhan_vien'] },
    { id: 'dishes', label: 'Thực Đơn Món', icon: Utensils, roles: ['admin', 'bep'] },
    { id: 'inventory', label: 'Kho & Định Lượng', icon: Boxes, roles: ['admin', 'bep'] },
    { id: 'customers', label: 'Khách Hàng', icon: Users, roles: ['admin', 'nhan_vien'] },
    { id: 'reports', label: 'Báo Cáo Doanh Thu', icon: BarChart3, roles: ['admin'] }
  ];

  const menuDuocPhep = danhSachMenu.filter(item => item.roles.includes(vaiTro));

  return (
    <>
      {/* Lớp nền mờ khi mở Drawer trên Mobile / Tablet */}
      {sidebarMo && (
        <div 
          onClick={dongSidebar}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Thanh Menu điều hướng: Desktop cố định, Mobile là Drawer trượt */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen shadow-2xl lg:shadow-xs transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarMo ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Khối thương hiệu Logo & Tiêu đề */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0077B6] to-[#00B4D8] flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-black tracking-tight uppercase bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent leading-tight whitespace-nowrap">
                  ROYAL BISTRO
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Restaurant POS
                </div>
              </div>
            </div>

            {/* Nút đóng Drawer trên Mobile */}
            <button
              type="button"
              onClick={dongSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
              title="Đóng menu điều hướng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Danh sách các nút chức năng phân hệ */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuDuocPhep.map((item) => {
              const Icon = item.icon;
              const dangChon = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (dongSidebar) dongSidebar();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    dangChon
                      ? 'bg-[#0077B6] text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#CAF0F8]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${dangChon ? 'text-white stroke-[2.5]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
                      dangChon ? 'bg-white text-[#023E8A]' : 'bg-[#CAF0F8] text-[#023E8A] border border-[#ADE8F4] animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      {/* Thông tin chân trang đồ án */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
        <div className="text-[11px] font-semibold text-slate-600">
          Chuyên Đề BE (Node.js) & FE (React.js)
        </div>
        <div className="text-[10px] text-amber-700 font-mono font-bold mt-0.5">
          REST API + Socket.io Active
        </div>
      </div>
    </aside>
  </>
);
}

// Bí danh tương thích
export const Sidebar = ThanhMenuDieuHuong;
