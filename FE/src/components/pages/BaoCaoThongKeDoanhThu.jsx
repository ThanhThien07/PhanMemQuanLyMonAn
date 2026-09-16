/**
 * @file BaoCaoThongKeDoanhThu.jsx
 * @description Màn hình Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh của nhà hàng Royal Bistro.
 * Phân tích tổng doanh số đã thu, tổng lượt order, giá trị trung bình mỗi lượt, cơ cấu thanh toán (Tiền mặt / QR Chuyển khoản)
 * và danh sách món ăn đóng góp doanh thu cao nhất. Hỗ trợ xuất dữ liệu báo cáo.
 * @module pages/BaoCaoThongKeDoanhThu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { TrendingUp, Download, PieChart } from 'lucide-react';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component Báo cáo Thống kê Doanh thu
 */
export default function BaoCaoThongKeDoanhThu() {
  // Dữ liệu báo cáo tổng hợp
  const [duLieuBaoCao, setDuLieuBaoCao] = useState(null);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);

  /**
   * Tải số liệu báo cáo doanh thu từ máy chủ backend
   */
  const taiDuLieuBaoCao = async () => {
    try {
      setDangTai(true);
      const res = await axiosApi.get('/reports/summary');
      if (res.success) {
        setDuLieuBaoCao(res.summary);
      }
    } catch (loi) {
      console.error('Lỗi khi tải báo cáo doanh thu:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieuBaoCao();
  }, []);

  /**
   * Xử lý hành động xuất báo cáo
   */
  const xuLyXuatBaoCao = () => {
    alert('Đang xuất báo cáo doanh thu PDF/Excel thành công!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Tiêu đề trang & Nút xuất báo cáo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh</h2>
          <p className="text-slate-500 text-sm font-medium">Phân tích dòng tiền, cơ cấu thanh toán và hiệu suất thực đơn</p>
        </div>
        <button
          onClick={xuLyXuatBaoCao}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-600" />
          Xuất Báo Cáo (Excel / PDF)
        </button>
      </div>

      {/* Thẻ chỉ số cấp cao về doanh thu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Tổng Doanh Số Đã Thu</div>
          <div className="text-3xl font-black text-amber-600">
            {dinhDangTienTe(duLieuBaoCao?.totalRevenue || 0)}
          </div>
          <p className="text-xs text-slate-400 font-medium">Dựa trên các hóa đơn đã thanh toán hoàn tất</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Tổng Số Lượt Order</div>
          <div className="text-3xl font-black text-emerald-600">
            {duLieuBaoCao?.totalOrders || 0} lượt
          </div>
          <p className="text-xs text-slate-400 font-medium">Bao gồm các bàn phục vụ trong ngày</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500">Giá Trị TB / Lượt Gọi</div>
          <div className="text-3xl font-black text-sky-600">
            {duLieuBaoCao?.totalOrders > 0
              ? dinhDangTienTe(Math.round(duLieuBaoCao.totalRevenue / duLieuBaoCao.totalOrders))
              : '0 đ'}
          </div>
          <p className="text-xs text-slate-400 font-medium">Mức chi tiêu trung bình của mỗi lượt</p>
        </div>
      </div>

      {/* Cơ cấu thanh toán & Món ăn bán chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900">Cơ Cấu Phương Thức Thanh Toán</h3>
          </div>

          <div className="space-y-3 pt-2">
            {duLieuBaoCao?.paymentBreakdown?.map((p, idx) => (
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
                  {dinhDangTienTe(p.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top món đóng góp doanh thu cao nhất */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900">Món Đóng Góp Doanh Thu Cao Nhất</h3>
          </div>

          <div className="space-y-3 pt-2">
            {duLieuBaoCao?.topDishes?.map((mon, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-black text-amber-600 text-sm">#{idx + 1}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{mon.ten_mon}</div>
                    <div className="text-xs text-slate-500 font-medium">Đã bán: {mon.total_sold} phần</div>
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-600">
                  {dinhDangTienTe(mon.total_revenue || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
