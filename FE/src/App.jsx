/**
 * @file App.jsx
 * @description Component điều phối tuyến đường và phân quyền giao diện chính của ứng dụng Royal Bistro.
 * Xử lý truy cập khách quét mã QR bàn (?table=X), kiểm tra đăng nhập người dùng,
 * và điều hướng giữa các module: Dashboard, POS Gọi Món, Sơ Đồ Bàn, KDS Bếp, Đặt Bàn, Thực Đơn, Kho, Khách Hàng, Báo Cáo.
 * @module App
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import { useNguoiDung } from './context/NguoiDungContext';
import BoCucGiaoDienChinh from './components/layout/BoCucGiaoDienChinh';
import DangNhapHeThong from './pages/DangNhapHeThong';
import TongQuanDashboard from './pages/TongQuanDashboard';
import GoiMonTaiBanPOS from './pages/GoiMonTaiBanPOS';
import QuanLySoDoBan from './pages/QuanLySoDoBan';
import ManHinhBepKDS from './pages/ManHinhBepKDS';
import QuanLyDatBanTruoc from './pages/QuanLyDatBanTruoc';
import QuanLyThucDonMonAn from './pages/QuanLyThucDonMonAn';
import QuanLyKhoNguyenLieu from './pages/QuanLyKhoNguyenLieu';
import QuanLyKhachHang from './pages/QuanLyKhachHang';
import BaoCaoThongKeDoanhThu from './pages/BaoCaoThongKeDoanhThu';
import KhachHangGoiMonQR from './pages/KhachHangGoiMonQR';
import { VongXoayTai } from './components/common/HuyHieuTrangThai';

/**
 * Component gốc của ứng dụng (Root Application)
 */
export default function App() {
  const { nguoiDung, dangTai } = useNguoiDung();
  const [tabHienTai, setTabHienTai] = useState('dashboard');

  // Kiểm tra nếu khách hàng đang truy cập bằng đường dẫn quét mã QR bàn (?table=1 hoặc /table/1 hoặc /qr)
  const thamSoUrl = new URLSearchParams(window.location.search);
  const laKhachQuetQR =
    thamSoUrl.has('table') ||
    window.location.pathname.includes('/table') ||
    window.location.pathname.includes('/qr');

  // Nếu là khách quét mã QR, hiển thị trực tiếp giao diện Web gọi món bàn
  if (laKhachQuetQR) {
    return <KhachHangGoiMonQR />;
  }

  // Màn hình chờ khi đang nạp thông tin phiên đăng nhập
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

  // Chưa đăng nhập -> Hiển thị trang đăng nhập
  if (!nguoiDung) {
    return (
      <DangNhapHeThong
        onGoToQrOrder={() => {
          window.location.href = '/?table=1';
        }}
      />
    );
  }

  /**
   * Render component tương ứng với tab được chọn
   */
  const hienThiTrangHienTai = () => {
    switch (tabHienTai) {
      case 'dashboard':
        return <TongQuanDashboard setActiveTab={setTabHienTai} />;
      case 'pos':
        return <GoiMonTaiBanPOS />;
      case 'tables':
        return <QuanLySoDoBan setActiveTab={setTabHienTai} />;
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
        return <KhachHangGoiMonQR onExitToStaff={() => setTabHienTai('tables')} />;
      default:
        return <TongQuanDashboard setActiveTab={setTabHienTai} />;
    }
  };

  return (
    <BoCucGiaoDienChinh activeTab={tabHienTai} setActiveTab={setTabHienTai}>
      {hienThiTrangHienTai()}
    </BoCucGiaoDienChinh>
  );
}
