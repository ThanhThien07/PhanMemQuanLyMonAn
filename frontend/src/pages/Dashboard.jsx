import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Grid3X3,
  ChefHat,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function Dashboard({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      if (res.success) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-semibold">Đang tải dữ liệu tổng quan...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng Doanh Thu',
      value: formatCurrency(summary?.totalRevenue || 0),
      change: '+14.5% so với hôm qua',
      icon: DollarSign,
      color: 'from-amber-500/10 to-amber-600/5 text-amber-700 border-amber-200'
    },
    {
      label: 'Đơn Đặt Món Đã Xong',
      value: `${summary?.totalOrders || 0} lượt`,
      change: 'Hoạt động liên tục',
      icon: ShoppingBag,
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Cảnh Báo Tồn Kho',
      value: `${summary?.lowStockCount || 0} nguyên liệu`,
      change: 'Cần nhập thêm sớm',
      icon: AlertTriangle,
      color: summary?.lowStockCount > 0 
        ? 'from-rose-500/10 to-rose-600/5 text-rose-700 border-rose-200' 
        : 'from-slate-100 to-slate-50 text-slate-700 border-slate-200'
    },
    {
      label: 'Lịch Đặt Bàn Hôm Nay',
      value: `${summary?.reservationsToday || 0} lịch hẹn`,
      change: 'Đã xác nhận sẵn sàng',
      icon: Clock,
      color: 'from-sky-500/10 to-sky-600/5 text-sky-700 border-sky-200'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-gradient-to-br ${stat.color} border bg-white shadow-xs relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Insights (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Selling Dishes */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Top Món Ăn Bán Chạy Nhất</h3>
              <p className="text-xs text-slate-500 font-medium">Xếp hạng theo số lượng đã phục vụ</p>
            </div>
            <button
              onClick={() => setActiveTab('dishes')}
              className="text-xs text-amber-700 hover:text-amber-600 font-bold flex items-center gap-1"
            >
              Xem thực đơn <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summary?.topDishes?.length > 0 ? (
              summary.topDishes.map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-center text-sm font-black text-amber-600">#{i + 1}</span>
                    <img
                      src={dish.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                      alt={dish.ten_mon}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{dish.ten_mon}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {formatCurrency(dish.gia)} / phần
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-600">
                      {dish.total_sold} đĩa
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {formatCurrency(dish.total_revenue || 0)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">Chưa có dữ liệu gọi món</div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Table Status Breakdown */}
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
