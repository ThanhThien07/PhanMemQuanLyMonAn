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
  TrendingUp, 
  Clock, 
  Grid3X3,
  ChefHat,
  ArrowUpRight
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Biểu ngữ Chào Mừng */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-orange-50/60 border border-amber-200 rounded-3xl p-6 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Chào Mừng Đến Với Bảng Điều Khiển Royal Bistro
            </h2>
            <p className="text-slate-600 text-sm font-medium mt-1">
              Theo dõi doanh số, quản lý bàn ăn, điều phối nhà bếp và kho nguyên liệu thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('pos')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4" />
              Mở POS Gọi Món
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-amber-600" />
              Màn Hình Bếp
            </button>
          </div>
        </div>
      </div>

      {/* Lưới Thẻ Chỉ Số KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {theThongKe.map((the, chiSo) => {
          const BieuTuongIcon = the.bieuTuong;
          return (
            <div
              key={chiSo}
              className={`p-5 rounded-3xl bg-gradient-to-br ${the.mauSac} border bg-white shadow-xs relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {the.tieuDe}
                </span>
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <BieuTuongIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {the.giaTri}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>{the.bienDong}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khu vực chi tiết (2 Cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái 2 phần: Danh sách Món Ăn Bán Chạy Nhất */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Top Món Ăn Bán Chạy Nhất</h3>
              <p className="text-xs text-slate-500 font-medium">Xếp hạng theo số lượng đã phục vụ</p>
            </div>
            <button
              onClick={() => setActiveTab('dishes')}
              className="text-xs text-amber-700 hover:text-amber-600 font-bold flex items-center gap-1 cursor-pointer"
            >
              Xem thực đơn <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {duLieuTongHop?.topDishes?.length > 0 ? (
              duLieuTongHop.topDishes.map((mon, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-center text-sm font-black text-amber-600">#{i + 1}</span>
                    <img
                      src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                      alt={mon.ten_mon}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{mon.ten_mon}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {dinhDangTienTe(mon.gia)} / phần
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-600">
                      {mon.total_sold} đĩa
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {dinhDangTienTe(mon.total_revenue || 0)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">Chưa có dữ liệu gọi món</div>
            )}
          </div>
        </div>

        {/* Cột Phải 1 phần: Phân bố Trạng Thái Bàn Ăn */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Trạng Thái Sơ Đồ Bàn</h3>
            <p className="text-xs text-slate-500 font-medium mb-5">Tỷ lệ sử dụng bàn thực tế</p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-sm font-bold text-emerald-900">Bàn Trống (Sẵn Sàng)</span>
                </div>
                <span className="text-lg font-black text-slate-900">8 bàn</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-bold text-amber-900">Đang Phục Vụ</span>
                </div>
                <span className="text-lg font-black text-slate-900">3 bàn</span>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                  <span className="text-sm font-bold text-sky-900">Đã Đặt Trước</span>
                </div>
                <span className="text-lg font-black text-slate-900">1 bàn</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('tables')}
            className="w-full mt-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Grid3X3 className="w-4 h-4 text-amber-600" />
            Xem Chi Tiết Sơ Đồ Bàn
          </button>
        </div>
      </div>
    </div>
  );
}
