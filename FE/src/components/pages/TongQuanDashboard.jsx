/**
 * @file TongQuanDashboard.jsx
 * @description Trang Bảng Điều Khiển Tổng Quan (Dashboard) của hệ thống Royal Bistro.
 * Hiển thị các chỉ số kinh doanh then chốt (KPIs), cảnh báo tồn kho, danh sách món bán chạy và trạng thái bàn ăn.
 * @module pages/TongQuanDashboard
 * @author Nguyễn Hoàng Hưng
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  BarChart3,
  Utensils
} from 'lucide-react';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component hiển thị Bảng điều khiển tổng quan nhà hàng
 * @param {Object} props - Thuộc tính component
 * @param {Function} props.setActiveTab - Hàm điều hướng chuyển đổi tab chức năng
 */
export default function TongQuanDashboard({ setActiveTab }) {
  // Trạng thái lưu trữ dữ liệu tổng hợp
  const [duLieuTongHop, setDuLieuTongHop] = useState(null);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);

  /**
   * Tải số liệu thống kê tổng hợp từ máy chủ backend
   */
  const taiDuLieuTongHop = async () => {
    try {
      setDangTai(true);
      const phanHoi = await axiosApi.get('/reports/summary');
      if (phanHoi.success) {
        setDuLieuTongHop(phanHoi.summary);
      }
    } catch (loi) {
      console.error('Lỗi khi tải dữ liệu tổng quan:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieuTongHop();
  }, []);

  if (dangTai) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-semibold">Đang tải dữ liệu tổng quan...</span>
        </div>
      </div>
    );
  }

  // Danh sách thẻ thống kê KPI
  const theThongKe = [
    {
      tieuDe: 'Tổng Doanh Thu',
      giaTri: dinhDangTienTe(duLieuTongHop?.totalRevenue || 0),
      bienDong: '+14.5% so với hôm qua',
      bieuTuong: DollarSign,
      mauSac: 'from-amber-500/10 to-amber-600/5 text-amber-700 border-amber-200'
    },
    {
      tieuDe: 'Đơn Đặt Món Đã Xong',
      giaTri: `${duLieuTongHop?.totalOrders || 0}\u00A0lượt`,
      bienDong: 'Hoạt động liên tục',
      bieuTuong: ShoppingBag,
      mauSac: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-200'
    },
    {
      tieuDe: 'Cảnh Báo Tồn Kho',
      giaTri: `${duLieuTongHop?.lowStockCount || 0}\u00A0nguyên\u00A0liệu`,
      bienDong: 'Cần nhập thêm sớm',
      bieuTuong: AlertTriangle,
      mauSac: duLieuTongHop?.lowStockCount > 0 
        ? 'from-rose-500/10 to-rose-600/5 text-rose-700 border-rose-200' 
        : 'from-slate-100 to-slate-50 text-slate-700 border-slate-200'
    },
    {
      tieuDe: 'Lịch Đặt Bàn Hôm Nay',
      giaTri: `${duLieuTongHop?.reservationsToday || 0}\u00A0lịch\u00A0hẹn`,
      bienDong: 'Đã xác nhận sẵn sàng',
      bieuTuong: Clock,
      mauSac: 'from-sky-500/10 to-sky-600/5 text-sky-700 border-sky-200'
    }
  ];

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Biểu ngữ Tổng Quan */}
      <div className="card border-2 border-slate-200/90 rounded-4 shadow-sm p-4 p-md-4 bg-gradient-to-r from-blue-50/70 via-white to-red-50/40 overflow-hidden hover:shadow-md transition-shadow">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill fw-bold text-xs shadow-2xs">
                Admin
              </span>
              <span className="text-xs text-slate-500 font-semibold">Thống Kê Hôm Nay</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0">
              Tổng Quan Quản Lý & Thống Kê
            </h2>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="btn btn-primary text-white fw-bold px-3.5 py-2 rounded-pill d-inline-flex align-items-center justify-content-center gap-2 shadow-xs cursor-pointer text-xs whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Báo Cáo Doanh Thu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dishes')}
              className="bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-700 fw-bold px-3.5 py-2 rounded-pill d-inline-flex align-items-center justify-content-center gap-2 shadow-2xs cursor-pointer text-xs border-2 border-slate-200/90 hover:border-blue-400 transition-all whitespace-nowrap"
            >
              <Utensils className="w-4 h-4 text-red-600 shrink-0" />
              <span className="whitespace-nowrap">Quản Lý Món</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lưới Thẻ Chỉ Số KPI tách nền, border 2px, đổ bóng sâu */}
      <div className="row g-3 g-md-4">
        {theThongKe.map((the, chiSo) => {
          const BieuTuongIcon = the.bieuTuong;
          return (
            <div key={chiSo} className="col-12 col-sm-6 col-xl-3">
              <div
                className="card h-100 p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all hover:-translate-y-1 d-flex flex-column justify-content-between"
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 gap-2 min-w-0">
                    <span className="text-xs font-black uppercase text-slate-600 whitespace-nowrap text-nowrap truncate min-w-0">
                      {the.tieuDe}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 d-flex align-items-center justify-content-center shadow-2xs shrink-0">
                      <BieuTuongIcon className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 tabular-nums whitespace-nowrap text-nowrap truncate">
                    {the.giaTri}
                  </div>
                </div>
                <div className="text-xs text-slate-600 d-flex align-items-center gap-1.5 font-bold pt-2 border-top border-slate-100 whitespace-nowrap text-nowrap">
                  <TrendingUp className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                  <span className="truncate">{the.bienDong}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khu vực chi tiết (2 Cột Bootstrap Row): Top món ăn & Phân bố bàn */}
      <div className="row g-4">
        {/* Cột Trái: Danh sách Món Ăn Bán Chạy Nhất (Tách nền, tạo khối, ảnh to, tương phản cao) */}
        <div className="col-12 col-lg-8">
          <div className="card h-100 bg-white border-2 border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-0 d-flex align-items-center gap-2 whitespace-nowrap">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 d-flex align-items-center justify-content-center text-sm shadow-2xs shrink-0">
                    🏆
                  </span>
                  <span className="whitespace-nowrap">Top Món Ăn Bán Chạy Nhất</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold mb-0 mt-1">
                  Xếp hạng theo số lượng đã phục vụ tại nhà hàng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dishes')}
                className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-pill px-3.5 py-1.5 font-black d-inline-flex align-items-center gap-1.5 text-xs shadow-2xs transition-all cursor-pointer border-2 border-blue-200 hover:border-blue-600 whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Xem thực đơn</span>
                <i className="bi bi-arrow-up-right font-black"></i>
              </button>
            </div>

            <div className="space-y-3.5">
              {duLieuTongHop?.topDishes?.length > 0 ? (
                duLieuTongHop.topDishes.map((mon, i) => {
                  let badgeRankClass = 'bg-slate-200 text-slate-700';
                  if (i === 0) badgeRankClass = 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-300 shadow-xs';
                  else if (i === 1) badgeRankClass = 'bg-slate-800 text-white shadow-xs';
                  else if (i === 2) badgeRankClass = 'bg-amber-800 text-white shadow-xs';

                  return (
                    <div
                      key={i}
                      className="d-flex align-items-center justify-content-between p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 hover:bg-white border-2 border-slate-200/90 hover:border-blue-400 transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 gap-3 group"
                    >
                      <div className="d-flex align-items-center gap-3 sm:gap-3.5 min-w-0">
                        {/* Huy hiệu thứ hạng */}
                        <span className={`w-8 h-8 rounded-xl px-0 py-0 d-flex align-items-center justify-content-center text-xs font-black shrink-0 ${badgeRankClass}`}>
                          #{i + 1}
                        </span>

                        {/* Ảnh món ăn to đẹp, ăn sát khối */}
                        <img
                          src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={mon.ten_mon}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                        />

                        {/* Tên món và đơn giá */}
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {mon.ten_mon}
                          </div>
                          <div className="text-xs text-slate-600 font-bold mt-0.5">
                            {dinhDangTienTe(mon.gia)} <span className="text-slate-400 font-normal">/ phần</span>
                          </div>
                        </div>
                      </div>

                      {/* Số lượng bán và doanh thu */}
                      <div className="text-end shrink-0">
                        <span className="badge bg-red-600 text-white px-3 py-1.5 rounded-pill font-black text-xs shadow-xs tracking-wide">
                          {mon.total_sold} đĩa
                        </span>
                        <div className="text-xs sm:text-sm text-slate-900 font-black mt-1.5 tabular-nums">
                          {dinhDangTienTe(mon.total_revenue || 0)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5 text-slate-400 text-sm font-medium">
                  <i className="bi bi-inbox fs-3 d-block mb-2 text-slate-300"></i>
                  Chưa có dữ liệu gọi món
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải: Phân bố Trạng Thái Bàn Ăn (Tách nền, tạo khối, tương phản cao) */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 bg-white border-2 border-slate-200/90 rounded-3xl p-4 sm:p-5 d-flex flex-column justify-content-between shadow-sm hover:shadow-lg transition-shadow">
            <div>
              <div className="d-flex align-items-center justify-content-between gap-2 mb-1 pb-3 border-bottom border-slate-100 min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0 d-flex align-items-center gap-2 whitespace-nowrap text-nowrap shrink-0">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/15 text-blue-600 d-flex align-items-center justify-content-center text-sm shadow-2xs shrink-0">
                    <i className="bi bi-grid-fill"></i>
                  </span>
                  <span className="whitespace-nowrap text-nowrap">Trạng Thái Bàn</span>
                </h3>
                <span className="badge bg-slate-100 text-slate-800 border border-slate-200/90 rounded-pill px-2.5 py-1 text-xs font-black shrink-0 whitespace-nowrap text-nowrap">
                  Tổng 12 bàn
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mb-3 mt-1.5">Tỷ lệ sử dụng bàn thực tế theo thời gian thực</p>

              {/* 3 Khối trạng thái bàn tạo khối mạnh mẽ, tương phản cao */}
              <div className="space-y-3.5">
                {/* Khối Bàn Trống */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 hover:border-emerald-500 d-flex align-items-center justify-content-between shadow-2xs hover:shadow-sm transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-circle bg-emerald-500 ring-4 ring-emerald-200/80 shrink-0"></span>
                    <span className="text-sm font-black text-emerald-950">Bàn Trống (Sẵn Sàng)</span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-pill bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xs tabular-nums">
                    8 bàn
                  </span>
                </div>

                {/* Khối Đang Phục Vụ */}
                <div className="p-4 rounded-2xl bg-red-50/80 border-2 border-red-300 hover:border-red-500 d-flex align-items-center justify-content-between shadow-2xs hover:shadow-sm transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-circle bg-red-500 ring-4 ring-red-200/80 shrink-0 animate-ping"></span>
                    <span className="text-sm font-black text-red-950">Đang Phục Vụ</span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-pill bg-red-600 text-white font-black text-xs sm:text-sm shadow-xs tabular-nums">
                    3 bàn
                  </span>
                </div>

                {/* Khối Đã Đặt Trước */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-300 hover:border-blue-500 d-flex align-items-center justify-content-between shadow-2xs hover:shadow-sm transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-circle bg-blue-500 ring-4 ring-blue-200/80 shrink-0"></span>
                    <span className="text-sm font-black text-blue-950">Đã Đặt Trước</span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-pill bg-blue-600 text-white font-black text-xs sm:text-sm shadow-xs tabular-nums">
                    1 bàn
                  </span>
                </div>
              </div>
            </div>

            {/* Nút xem chi tiết sơ đồ bàn bo tròn, cùng phong cách landing page */}
            <button
              onClick={() => setActiveTab('tables')}
              className="btn btn-primary w-100 mt-5 py-3 rounded-pill fw-bold text-xs d-flex align-items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
              <span>Xem Chi Tiết Sơ Đồ Bàn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
