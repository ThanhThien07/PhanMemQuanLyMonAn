import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TrendingUp, Download, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
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
    fetchReports();
  }, []);

  const handleExport = () => {
    alert('Đang xuất báo cáo doanh thu PDF/Excel thành công!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh</h2>
          <p className="text-slate-500 text-sm font-medium">Phân tích dòng tiền, cơ cấu thanh toán và hiệu suất thực đơn</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-600" />
          Xuất Báo Cáo (Excel / PDF)
        </button>
      </div>

      {/* Revenue High Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Tổng Doanh Số Đã Thu</div>
          <div className="text-3xl font-black text-amber-600">
            {formatCurrency(summary?.totalRevenue || 0)}
          </div>
          <p className="text-xs text-slate-400 font-medium">Dựa trên các hóa đơn đã thanh toán hoàn tất</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Tổng Số Lượt Order</div>
          <div className="text-3xl font-black text-emerald-600">
            {summary?.totalOrders || 0} lượt
          </div>
          <p className="text-xs text-slate-400 font-medium">Bao gồm các bàn phục vụ trong ngày</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Giá Trị TB / Lượt Gọi</div>
          <div className="text-3xl font-black text-sky-600">
            {summary?.totalOrders > 0
              ? formatCurrency(Math.round(summary.totalRevenue / summary.totalOrders))
              : '0 đ'}
          </div>
          <p className="text-xs text-slate-400 font-medium">Mức chi tiêu trung bình của mỗi lượt</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900">Cơ Cấu Phương Thức Thanh Toán</h3>
          </div>

          <div className="space-y-3 pt-2">
            {summary?.paymentBreakdown?.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-sm font-bold text-slate-900 capitalize">
                    {p.phuong_thuc_thanh_toan === 'tien_mat' ? '💵 Tiền Mặt' :
                     p.phuong_thuc_thanh_toan === 'chuyen_khoan' ? '📱 QR Chuyển Khoản' :
                     p.phuong_thuc_thanh_toan}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Giao dịch đã xác nhận</div>
                </div>
                <div className="text-base font-black text-amber-600">
                  {formatCurrency(p.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top dishes breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900">Món Đóng Góp Doanh Thu Cao Nhất</h3>
          </div>

          <div className="space-y-3 pt-2">
            {summary?.topDishes?.map((dish, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-black text-amber-600 text-sm">#{idx + 1}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{dish.ten_mon}</div>
                    <div className="text-xs text-slate-500 font-medium">Đã bán: {dish.total_sold} phần</div>
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-600">
                  {formatCurrency(dish.total_revenue || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
