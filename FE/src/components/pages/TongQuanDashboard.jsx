/**
 * @file TongQuanDashboard.jsx
 * @description Trang Bảng Điều Khiển Tổng Quan (Dashboard) của hệ thống Royal Bistro.
 * Hiển thị các chỉ số kinh doanh then chốt (KPIs), cảnh báo tồn kho, danh sách món bán chạy và trạng thái bàn ăn.
 * @module pages/TongQuanDashboard
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Clock 
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
      giaTri: `${duLieuTongHop?.totalOrders || 0} lượt`,
      bienDong: 'Hoạt động liên tục',
      bieuTuong: ShoppingBag,
      mauSac: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-200'
    },
    {
      tieuDe: 'Cảnh Báo Tồn Kho',
      giaTri: `${duLieuTongHop?.lowStockCount || 0} nguyên liệu`,
      bienDong: 'Cần nhập thêm sớm',
      bieuTuong: AlertTriangle,
      mauSac: duLieuTongHop?.lowStockCount > 0 
        ? 'from-rose-500/10 to-rose-600/5 text-rose-700 border-rose-200' 
        : 'from-slate-100 to-slate-50 text-slate-700 border-slate-200'
    },
    {
      tieuDe: 'Lịch Đặt Bàn Hôm Nay',
      giaTri: `${duLieuTongHop?.reservationsToday || 0} lịch hẹn`,
      bienDong: 'Đã xác nhận sẵn sàng',
      bieuTuong: Clock,
      mauSac: 'from-sky-500/10 to-sky-600/5 text-sky-700 border-sky-200'
    }
  ];

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Biểu ngữ Chào Mừng */}
      <div className="card border border-amber-200 rounded-4 shadow-sm p-4 p-md-4 bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-orange-50/60 overflow-hidden">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-warning text-dark px-2.5 py-1 rounded-pill fw-bold text-xs">
                <i className="bi bi-stars me-1"></i>Hôm Nay
              </span>
              <span className="text-xs text-slate-500 font-semibold">Cập nhật thời gian thực</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
              Chào Mừng Đến Với Bảng Điều Khiển Royal Bistro
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mb-0">
              Theo dõi doanh số, quản lý bàn ăn, điều phối nhà bếp và kho nguyên liệu tức thời.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('pos')}
              className="btn btn-warning text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
              <span>Mở POS Gọi Món</span>
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className="btn btn-outline-secondary bg-white text-slate-800 fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-xs"
            >
              <i className="bi bi-fire text-danger"></i>
              <span>Màn Hình Bếp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lưới Thẻ Chỉ Số KPI sử dụng Bootstrap Row / Col kết hợp Tailwind */}
      <div className="row g-3 g-md-4">
        {theThongKe.map((the, chiSo) => {
          const BieuTuongIcon = the.bieuTuong;
          return (
            <div key={chiSo} className="col-12 col-sm-6 col-xl-3">
              <div
                className={`card h-100 p-3.5 rounded-4 bg-gradient-to-br ${the.mauSac} border bg-white shadow-sm transition-all hover:-translate-y-0.5`}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {the.tieuDe}
                  </span>
                  <div className="p-2 rounded-3 bg-white border border-slate-200 shadow-xs">
                    <BieuTuongIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  {the.giaTri}
                </div>
                <div className="text-xs text-slate-500 d-flex align-items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>{the.bienDong}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khu vực chi tiết (2 Cột Bootstrap Row) */}
      <div className="row g-4">
        {/* Cột Trái 8 phần: Danh sách Món Ăn Bán Chạy Nhất */}
        <div className="col-12 col-lg-8">
          <div className="card h-100 bg-white border border-slate-200 rounded-4 p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-0">
                  <i className="bi bi-trophy-fill text-warning me-2"></i>Top Món Ăn Bán Chạy Nhất
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-0">Xếp hạng theo số lượng đã phục vụ</p>
              </div>
              <button
                onClick={() => setActiveTab('dishes')}
                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
              >
                <span>Xem thực đơn</span>
                <i className="bi bi-arrow-up-right"></i>
              </button>
            </div>

            <div className="space-y-2.5">
              {duLieuTongHop?.topDishes?.length > 0 ? (
                duLieuTongHop.topDishes.map((mon, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-amber-100 text-amber-900 rounded-pill px-2.5 py-1 text-xs fw-bold">
                        #{i + 1}
                      </span>
                      <img
                        src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                        alt={mon.ten_mon}
                        className="w-11 h-11 rounded-3 object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{mon.ten_mon}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {dinhDangTienTe(mon.gia)} / phần
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="badge bg-warning-subtle text-amber-800 px-2.5 py-1 rounded-pill fw-bold text-xs">
                        {mon.total_sold} đĩa
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">
                        {dinhDangTienTe(mon.total_revenue || 0)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-slate-400 text-sm font-medium">
                  <i className="bi bi-inbox fs-3 d-block mb-2 text-slate-300"></i>
                  Chưa có dữ liệu gọi món
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải 4 phần: Phân bố Trạng Thái Bàn Ăn */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 bg-white border border-slate-200 rounded-4 p-4 d-flex flex-column justify-content-between shadow-sm">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-0">
                  <i className="bi bi-grid-fill text-primary me-2"></i>Trạng Thái Bàn
                </h3>
                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 text-xs">
                  Tổng 12 bàn
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">Tỷ lệ sử dụng bàn thực tế</p>

              <div className="space-y-3">
                <div className="p-3 rounded-3 bg-emerald-50 border border-emerald-200 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="badge bg-success rounded-circle p-1.5"></span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-900">Bàn Trống (Sẵn Sàng)</span>
                  </div>
                  <span className="badge bg-white text-emerald-800 border border-emerald-300 fs-6 fw-bold px-2.5 py-1">
                    8 bàn
                  </span>
                </div>

                <div className="p-3 rounded-3 bg-amber-50 border border-amber-200 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="badge bg-warning rounded-circle p-1.5"></span>
                    <span className="text-xs sm:text-sm font-bold text-amber-900">Đang Phục Vụ</span>
                  </div>
                  <span className="badge bg-white text-amber-800 border border-amber-300 fs-6 fw-bold px-2.5 py-1">
                    3 bàn
                  </span>
                </div>

                <div className="p-3 rounded-3 bg-sky-50 border border-sky-200 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="badge bg-info rounded-circle p-1.5"></span>
                    <span className="text-xs sm:text-sm font-bold text-sky-900">Đã Đặt Trước</span>
                  </div>
                  <span className="badge bg-white text-sky-800 border border-sky-300 fs-6 fw-bold px-2.5 py-1">
                    1 bàn
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('tables')}
              className="btn btn-outline-secondary w-100 mt-4 py-2.5 rounded-3 fw-bold text-xs d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-layout-wtf text-primary"></i>
              <span>Xem Chi Tiết Sơ Đồ Bàn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
