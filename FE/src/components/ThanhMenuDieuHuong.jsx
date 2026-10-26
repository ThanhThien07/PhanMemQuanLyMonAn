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
  
  // Chuẩn hóa xác định vai trò
  let vaiTro = user?.role || 'phuc_vu';
  const email = (user?.email || '').toLowerCase();
  if (email.includes('admin') || user?.role === 'admin') {
    vaiTro = 'admin';
  } else if (email.includes('thungan') || user?.role === 'thu_ngan') {
    vaiTro = 'thu_ngan';
  } else if (email.includes('bep') || user?.role === 'bep') {
    vaiTro = 'bep';
  } else if (email.includes('phucvu') || user?.role === 'phuc_vu' || user?.role === 'nhan_vien') {
    vaiTro = 'phuc_vu';
  }

  // Phân chia menu theo vai trò:
  // - Admin: Nhìn thấy ĐẦY ĐỦ TẤT CẢ các phân hệ để quản trị, theo dõi báo cáo và giám sát thống kê toàn diện.
  // - Thu Ngân: tables, pos (thanh toán hóa đơn & giải phóng bàn)
  // - Phục Vụ: tables, reservations, pos, qr_order
  // - Bếp: kitchen, inventory
  const danhSachMenu = [
    // Phân hệ Quản trị & Báo cáo Thống kê
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'reports', label: 'Báo Cáo Doanh Thu', icon: BarChart3, roles: ['admin'] },

    // Phân hệ Vận hành Bàn & Gọi món (Admin có quyền xem để giám sát thực tế)
    { id: 'tables', label: 'Sơ Đồ Bàn', icon: Grid3X3, roles: ['admin', 'thu_ngan', 'phuc_vu'] },
    { id: 'pos', label: vaiTro === 'thu_ngan' ? 'POS Thu Ngân' : 'POS Gọi Món', icon: ShoppingBag, roles: ['admin', 'thu_ngan', 'phuc_vu'] },
    { id: 'reservations', label: 'Đặt Bàn Trước', icon: CalendarClock, roles: ['admin', 'phuc_vu'] },
    { id: 'qr_order', label: 'Khách Quét QR Bàn', icon: QrCode, badge: 'QR', roles: ['admin', 'phuc_vu'] },

    // Phân hệ Chế biến Bếp & Kho (Admin xem để theo dõi định mức và kiểm kê)
    { id: 'kitchen', label: 'Màn Hình Bếp', icon: ChefHat, badge: 'Live', roles: ['admin', 'bep'] },
    { id: 'inventory', label: 'Kho & Định Lượng', icon: Boxes, roles: ['admin', 'bep'] },

    // Phân hệ Quản lý Món ăn & CRM
    { id: 'dishes', label: 'Thực Đơn Món', icon: Utensils, roles: ['admin'] },
    { id: 'customers', label: 'Khách Hàng CRM', icon: Users, roles: ['admin'] }
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

      {/* Thanh Menu điều hướng: Cố định hoàn toàn (Sticky), không bị trôi hay di chuyển khi cuộn trang */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-30
        ${sidebarMo ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Khối thương hiệu Logo & Tiêu đề */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-black tracking-tight uppercase bg-gradient-to-r from-blue-900 via-blue-700 to-red-600 bg-clip-text text-transparent leading-tight whitespace-nowrap">
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
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
              title="Đóng menu điều hướng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Danh sách các nút chức năng phân hệ: căn trái text-start, không bao giờ ngắt chữ */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-start ${
                    dangChon
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${dangChon ? 'text-white stroke-[2.5]' : 'text-slate-500'}`} />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full shrink-0 ${
                      dangChon ? 'bg-white text-blue-700' : 'bg-red-600 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      {/* Chân trang sidebar hiển thị vai trò tài khoản & phiên bản */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {vaiTro === 'admin' ? 'Quản Trị Viên' :
             vaiTro === 'thu_ngan' ? 'Thu Ngân POS' :
             vaiTro === 'bep' ? 'Bếp Trưởng' : 'Nhân Viên Phục Vụ'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
          Royal Bistro POS v2.0
        </div>
      </div>
    </aside>
  </>
);
}

// Bí danh tương thích
export const Sidebar = ThanhMenuDieuHuong;
