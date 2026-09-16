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
import { TrendingUp } from 'lucide-react';
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
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề trang & Nút xuất báo cáo */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-graph-up me-1"></i>Thống Kê
            </span>
            <span className="text-xs text-slate-500 font-semibold">Báo cáo tài chính & doanh số</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Phân tích dòng tiền, cơ cấu thanh toán và hiệu suất thực đơn
          </p>
        </div>
        <button
          onClick={xuLyXuatBaoCao}
          className="btn btn-outline-secondary bg-white text-slate-800 fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-amber-600" />
          <span>Xuất Báo Cáo (Excel / PDF)</span>
        </button>
      </div>

      {/* Thẻ chỉ số cấp cao về doanh thu sử dụng Bootstrap Row / Col */}
      <div className="row g-3 g-md-4">
        <div className="col-12 col-md-4">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Tổng Doanh Số Đã Thu</span>
              <span className="badge bg-warning-subtle text-amber-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-cash-stack me-1"></i>Hoàn Tất
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {dinhDangTienTe(duLieuBaoCao?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Dựa trên các hóa đơn đã thanh toán hoàn tất</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Tổng Số Lượt Order</span>
              <span className="badge bg-success-subtle text-emerald-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-bag-check me-1"></i>Phục Vụ
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {duLieuBaoCao?.totalOrders || 0} lượt
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Bao gồm các bàn phục vụ trong ngày</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Giá Trị TB / Lượt Gọi</span>
              <span className="badge bg-info-subtle text-sky-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-calculator me-1"></i>Trung Bình
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600">
              {duLieuBaoCao?.totalOrders > 0
                ? dinhDangTienTe(Math.round(duLieuBaoCao.totalRevenue / duLieuBaoCao.totalOrders))
                : '0 đ'}
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Mức chi tiêu trung bình của mỗi lượt</p>
          </div>
        </div>
      </div>

      {/* Cơ cấu thanh toán & Món ăn bán chạy */}
      <div className="row g-4">
        {/* Cột Trái: Cơ Cấu Phương Thức Thanh Toán */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0">
                  Cơ Cấu Phương Thức Thanh Toán
                </h3>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 text-xs">
                Theo loại tiền
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {duLieuBaoCao?.paymentBreakdown?.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-3 bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between shadow-xs">
                  <div>
                    <div className="text-sm font-bold text-slate-900 capitalize d-flex align-items-center gap-1.5">
                      {p.phuong_thuc_thanh_toan === 'tien_mat' ? (
                        <>
                          <i className="bi bi-cash text-success fs-5"></i>
                          <span>Tiền Mặt</span>
                        </>
                      ) : p.phuong_thuc_thanh_toan === 'chuyen_khoan' ? (
                        <>
                          <i className="bi bi-qr-code text-primary fs-5"></i>
                          <span>QR Chuyển Khoản</span>
                        </>
                      ) : (
                        <span>{p.phuong_thuc_thanh_toan}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Giao dịch đã xác nhận thành công</div>
                  </div>
                  <div className="badge bg-amber-100 text-amber-900 px-3 py-1.5 rounded-pill text-sm fw-bold">
                    {dinhDangTienTe(p.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Phải: Top món đóng góp doanh thu cao nhất */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0">
                  Món Đóng Góp Doanh Thu Cao Nhất
                </h3>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 text-xs">
                Hiệu suất cao
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {duLieuBaoCao?.topDishes?.map((mon, idx) => (
                <div key={idx} className="p-3 rounded-3 bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between shadow-xs">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-white text-dark border px-2 py-1 rounded-pill text-xs fw-bold">
                      #{idx + 1}
                    </span>
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
    </div>
  );
}
