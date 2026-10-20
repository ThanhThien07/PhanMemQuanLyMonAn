/**
 * @file App.jsx
 * @description Component điều phối tuyến đường và phân quyền giao diện chính của ứng dụng Royal Bistro.
 * Áp dụng kỹ thuật tối ưu hóa Chương 8:
 * - Code Splitting (React.lazy & Suspense) tách nhỏ bundle theo route/tính năng (Slide 11).
 * - Cập nhật Title động theo từng màn hình phục vụ On-page SEO cho SPA (Slide 27).
 * - Giảm thời gian LCP & FCP cho khách hàng quét mã QR trên thiết bị di động.
 * @module App
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNguoiDung } from './components/context/NguoiDungContext';
import BoCucGiaoDienChinh from './components/layout/BoCucGiaoDienChinh';
import { VongXoayTai } from './components/common/HuyHieuTrangThai';

// Tối ưu Code Splitting: Lazy-loading từng trang theo nhu cầu sử dụng thực tế (Slide 11)
const KhachHangGoiMonQR = lazy(() => import('./components/pages/KhachHangGoiMonQR'));
const DangNhapHeThong = lazy(() => import('./components/pages/DangNhapHeThong'));
const TongQuanDashboard = lazy(() => import('./components/pages/TongQuanDashboard'));
const GoiMonTaiBanPOS = lazy(() => import('./components/pages/GoiMonTaiBanPOS'));
const QuanLySoDoBan = lazy(() => import('./components/pages/QuanLySoDoBan'));
const ManHinhBepKDS = lazy(() => import('./components/pages/ManHinhBepKDS'));
const QuanLyDatBanTruoc = lazy(() => import('./components/pages/QuanLyDatBanTruoc'));
const QuanLyThucDonMonAn = lazy(() => import('./components/pages/QuanLyThucDonMonAn'));
const QuanLyKhoNguyenLieu = lazy(() => import('./components/pages/QuanLyKhoNguyenLieu'));
const QuanLyKhachHang = lazy(() => import('./components/pages/QuanLyKhachHang'));
const BaoCaoThongKeDoanhThu = lazy(() => import('./components/pages/BaoCaoThongKeDoanhThu'));

/**
 * Component hiển thị khung chờ khi tải module động
 */
function TrangThaiDangTaiModule({ thongBao = 'Đang tải dữ liệu module...' }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <VongXoayTai size="lg" />
        <span className="text-slate-500 font-semibold text-xs tracking-wide">{thongBao}</span>
      </div>
    </div>
  );
}

/**
 * Component gốc của ứng dụng (Root Application)
 */
export default function App() {
  const { nguoiDung, dangTai } = useNguoiDung();

  // Kiểm tra nếu khách hàng đang truy cập bằng đường dẫn quét mã QR bàn (?table=1 hoặc /table/1 hoặc /qr)
  const thamSoUrl = new URLSearchParams(window.location.search);
  const laKhachQuetQR =
    thamSoUrl.has('table') ||
    window.location.pathname.includes('/table') ||
    window.location.pathname.includes('/qr');

  // Khởi tạo tab hiện tại: Đọc từ URL ?tab= hoặc sessionStorage, mặc định 'tables' (Sơ Đồ Bàn)
  const [tabHienTai, setTabHienTai] = useState(() => {
    const tabUrl = thamSoUrl.get('tab');
    if (tabUrl) return tabUrl;
    const tabDaLuu = sessionStorage.getItem('royal_active_tab');
    if (tabDaLuu) return tabDaLuu;
    return 'tables';
  });

  const thayDoiTab = (tabMoi) => {
    setTabHienTai(tabMoi);
    sessionStorage.setItem('royal_active_tab', tabMoi);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabMoi);
    window.history.replaceState({}, '', url.toString());
  };

  // Dynamic Page Title cho SPA (Slide 27: Cập nhật title theo từng ngữ cảnh điều hướng)
  useEffect(() => {
    if (laKhachQuetQR || nguoiDung?.role === 'khach_hang') {
      const banSo = thamSoUrl.get('table') || '1';
      document.title = `Thực Đơn Gọi Món Bàn ${banSo} | Royal Bistro`;
      return;
    }

    if (!nguoiDung) {
      document.title = `Đăng Nhập Hệ Thống | Royal Bistro Restaurant`;
      return;
    }

    const mapTieuDe = {
      dashboard: 'Tổng Quan Dashboard Quản Trị | Royal Bistro',
      pos: 'POS Điểm Bán Hàng & Gọi Món Tại Bàn | Royal Bistro',
      tables: 'Sơ Đồ Quản Lý Bàn Ăn Thời Gian Thực | Royal Bistro',
      kitchen: 'Màn Hình Điều Phối Bếp KDS | Royal Bistro',
      reservations: 'Quản Lý Đặt Bàn Tiệc & Khách Hẹn | Royal Bistro',
      dishes: 'Quản Lý Thực Đơn & Danh Mục Món Ăn | Royal Bistro',
      inventory: 'Quản Lý Kho & Nhập Xuất Nguyên Liệu | Royal Bistro',
      customers: 'Chăm Sóc & Quản Lý Khách Hàng Thân Thiết | Royal Bistro',
      reports: 'Báo Cáo Thống Kê Doanh Thu & Hiệu Quả | Royal Bistro',
      qr_order: 'Giao Diện Gọi Món Bàn Khách Hàng | Royal Bistro'
    };

    document.title = mapTieuDe[tabHienTai] || 'ROYAL BISTRO - Nhà Hàng Ẩm Thực & Quản Lý';
  }, [tabHienTai, laKhachQuetQR, nguoiDung]);

  // 1. Màn hình chờ khi đang nạp thông tin phiên đăng nhập
  if (dangTai) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <VongXoayTai size="lg" />
          <span className="text-slate-600 font-semibold text-sm">Đang khởi động Royal Bistro...</span>
        </div>
      </div>
    );
  }

  // 2. Nếu khách quét mã QR HOẶC là tài khoản Khách Hàng (role === 'khach_hang'):
  // Luôn luôn hiển thị giao diện Khách Hàng Gọi Món QR trực tiếp trên bàn!
  if (laKhachQuetQR || nguoiDung?.role === 'khach_hang') {
    return (
      <Suspense fallback={<TrangThaiDangTaiModule thongBao="Đang tải thực đơn gọi món tại bàn..." />}>
        <KhachHangGoiMonQR
          onExitToStaff={
            nguoiDung && nguoiDung.role !== 'khach_hang'
              ? () => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('table');
                  url.searchParams.set('tab', 'tables');
                  window.location.href = url.toString();
                }
              : undefined
          }
        />
      </Suspense>
    );
  }

  // 3. Chưa đăng nhập -> Hiển thị trang đăng nhập
  if (!nguoiDung) {
    return (
      <Suspense fallback={<TrangThaiDangTaiModule thongBao="Đang chuẩn bị màn hình đăng nhập..." />}>
        <DangNhapHeThong
          onGoToQrOrder={() => {
            window.location.href = '/?table=1';
          }}
        />
      </Suspense>
    );
  }

  /**
   * Render component tương ứng với tab được chọn có Suspense bảo vệ
   */
  const hienThiTrangHienTai = () => {
    return (
      <Suspense fallback={<TrangThaiDangTaiModule thongBao="Đang chuyển đổi trang..." />}>
        {(() => {
          switch (tabHienTai) {
            case 'dashboard':
              return <TongQuanDashboard setActiveTab={thayDoiTab} />;
            case 'pos':
              return <GoiMonTaiBanPOS />;
            case 'tables':
              return <QuanLySoDoBan setActiveTab={thayDoiTab} />;
            case 'kitchen':
              return <ManHinhBepKDS />;
            case 'reservations':
              return <QuanLyDatBanTruoc />;
            case 'dishes':
              return <QuanLyThucDonMonAn />;
            case 'inventory':
              return <QuanLyKhoNguyenLieu />;
            case 'customers':
              return <QuanLyKhachHang />;
            case 'reports':
              return <BaoCaoThongKeDoanhThu />;
            case 'qr_order':
              return <KhachHangGoiMonQR onExitToStaff={() => thayDoiTab('tables')} />;
            default:
              return <QuanLySoDoBan setActiveTab={thayDoiTab} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <BoCucGiaoDienChinh activeTab={tabHienTai} setActiveTab={thayDoiTab}>
      {hienThiTrangHienTai()}
    </BoCucGiaoDienChinh>
  );
}
