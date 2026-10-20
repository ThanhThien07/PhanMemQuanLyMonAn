/**
 * @file BaoCaoThongKeDoanhThu.jsx
 * @description Màn hình Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh chi tiết của nhà hàng Royal Bistro.
 * Tính năng chính:
 * 1. Tổng doanh số, tổng số lượt gọi món, giá trị trung bình/lượt, cơ cấu thanh toán.
 * 2. Bộ lọc thời gian linh hoạt (Hôm nay, 7 ngày qua, Tháng này, Toàn bộ thời gian).
 * 3. BẢNG CHI TIẾT MÓN ĂN ĐÃ BÁN: Tên món, danh mục, đơn giá, tổng số lượng đã bán, doanh thu món, tỷ lệ đóng góp %.
 * 4. BẢNG LỊCH SỬ GIAO DỊCH & HÓA ĐƠN ĐÃ BÁN: Mã đơn, bàn số, món gọi x số lượng, thành tiền, hình thức thanh toán, thời gian.
 * 5. Xuất báo cáo dữ liệu dạng tệp Excel / CSV chuẩn UTF-8 trực tiếp về máy tính.
 * @module pages/BaoCaoThongKeDoanhThu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState, useMemo } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { 
  TrendingUp, 
  Download, 
  PieChart, 
  Search, 
  UtensilsCrossed, 
  ReceiptText, 
  Calendar,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';
import { useToast } from '../context/ThongBaoToastContext';

export default function BaoCaoThongKeDoanhThu() {
  const toast = useToast();
  // Dữ liệu báo cáo tổng hợp
  const [duLieuBaoCao, setDuLieuBaoCao] = useState(null);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Bộ lọc khoảng thời gian ('all', 'today', '7days', 'month')
  const [khoangThoiGian, setKhoangThoiGian] = useState('all');
  // Từ khóa tìm kiếm món ăn đã bán
  const [tuKhoaMon, setTuKhoaMon] = useState('');
  // Bộ lọc phương thức thanh toán cho danh sách giao dịch
  const [locPhuongThuc, setLocPhuongThuc] = useState('all');
  // Tab hiển thị chi tiết ('dishes' | 'orders')
  const [tabChiTiet, setTabChiTiet] = useState('dishes');

  /**
   * Tải số liệu báo cáo doanh thu từ máy chủ backend theo bộ lọc thời gian
   */
  const taiDuLieuBaoCao = async (range = khoangThoiGian) => {
    try {
      setDangTai(true);
      const res = await axiosApi.get(`/reports/summary?range=${range}`);
      if (res.success) {
        setDuLieuBaoCao(res.summary);
      }
    } catch (loi) {
      console.error('Lỗi khi tải báo cáo doanh thu:', loi);
      toast.loi(loi.message || 'Không thể tải báo cáo doanh thu', 'Lỗi Báo Cáo');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieuBaoCao(khoangThoiGian);
  }, [khoangThoiGian]);

  // Danh sách các món ăn đã bán sau khi lọc tìm kiếm
  const danhSachMonDaLoc = useMemo(() => {
    const list = duLieuBaoCao?.soldDishes || [];
    if (!tuKhoaMon.trim()) return list;
    const kw = tuKhoaMon.toLowerCase();
    return list.filter((m) =>
      m.ten_mon.toLowerCase().includes(kw) ||
      (m.danh_muc && m.danh_muc.toLowerCase().includes(kw))
    );
  }, [duLieuBaoCao, tuKhoaMon]);

  // Danh sách giao dịch đơn hàng sau khi lọc
  const danhSachGiaoDichDaLoc = useMemo(() => {
    const list = duLieuBaoCao?.detailedOrders || [];
    if (locPhuongThuc === 'all') return list;
    return list.filter((d) => d.phuong_thuc_thanh_toan === locPhuongThuc);
  }, [duLieuBaoCao, locPhuongThuc]);

  /**
   * Xử lý xuất báo cáo chi tiết ra file CSV chuẩn UTF-8 mở được trên Microsoft Excel
   */
  const xuLyXuatBaoCao = () => {
    try {
      const soldList = duLieuBaoCao?.soldDishes || [];
      if (soldList.length === 0) {
        toast.canhBao('Chưa có dữ liệu bán hàng để xuất file!', 'Thông Báo');
        return;
      }

      // Tạo nội dung CSV kèm UTF-8 BOM
      let csvContent = '\uFEFF';
      csvContent += 'BÁO CÁO CHI TIẾT MÓN ĂN ĐÃ BÁN - ROYAL BISTRO RESTAURANT\r\n';
      csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\r\n`;
      csvContent += `Khoảng thời gian: ${khoangThoiGian}\r\n`;
      csvContent += `Tổng doanh số: ${duLieuBaoCao?.totalRevenue || 0} VND\r\n\r\n`;

      csvContent += 'STT,Mã Món,Tên Món Ăn,Danh Mục,Đơn Giá (VND),Số Lượng Đã Bán (Phần),Tổng Doanh Thu (VND),Tỷ Trọng Doanh Thu (%)\r\n';

      soldList.forEach((m, idx) => {
        csvContent += `${idx + 1},"${m.mon_an_id}","${m.ten_mon}","${m.danh_muc || 'Món chính'}",${m.gia},${m.total_sold},${m.total_revenue},${m.revenue_share_pct}%\r\n`;
      });

      // Tạo Blob và kích hoạt download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `BaoCao_ChiTietBanHang_${khoangThoiGian}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.thanhCong('Đã tải xuống file báo cáo Excel (CSV) thành công!', 'Xuất Báo Cáo');
    } catch (err) {
      toast.loi('Lỗi khi xuất file báo cáo: ' + err.message, 'Lỗi');
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-5">
      {/* Tiêu đề trang & Bộ lọc thời gian & Nút xuất báo cáo */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-graph-up me-1"></i>Thống Kê Tài Chính
            </span>
            <span className="text-xs text-slate-500 font-semibold">Phân tích chuyên sâu hiệu quả bán hàng</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Báo Cáo Doanh Thu & Chi Tiết Món Đã Bán
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Xem danh sách cụ thể từng món đã bán, số lượng, doanh số và hóa đơn phục vụ
          </p>
        </div>

        <div className="d-flex flex-wrap items-center gap-2.5">
          {/* Nhóm nút lọc khoảng thời gian */}
          <div className="btn-group btn-group-sm bg-slate-100 p-1 rounded-3 border border-slate-200" role="group">
            {[
              { id: 'all', label: 'Toàn Bộ' },
              { id: 'today', label: 'Hôm Nay' },
              { id: '7days', label: '7 Ngày' },
              { id: 'month', label: 'Tháng Này' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setKhoangThoiGian(btn.id)}
                className={`btn btn-sm rounded-2 font-bold px-3 py-1.5 transition-all text-xs ${
                  khoangThoiGian === btn.id
                    ? 'btn-primary text-white shadow-xs'
                    : 'btn-light bg-transparent text-slate-600 border-0 hover:bg-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={xuLyXuatBaoCao}
            className="btn btn-outline-secondary bg-white text-slate-800 fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-xs hover:bg-slate-50"
            title="Xuất bảng chi tiết ra Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm">Xuất Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Thẻ chỉ số tổng quan (KPI Cards) */}
      <div className="row g-3 g-md-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-1.5">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Tổng Doanh Thu</span>
              <span className="badge bg-warning-subtle text-amber-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-cash-stack me-1"></i>Đã Thu
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {dinhDangTienTe(duLieuBaoCao?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Hóa đơn thanh toán hoàn tất</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-1.5">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Tổng Đơn Phục Vụ</span>
              <span className="badge bg-success-subtle text-emerald-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-bag-check me-1"></i>Orders
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {duLieuBaoCao?.totalOrders || 0} lượt
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Các lượt gọi món thành công</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-1.5">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Số Loại Món Đã Bán</span>
              <span className="badge bg-info-subtle text-sky-800 rounded-pill px-2.5 py-1 text-xs">
                <UtensilsCrossed className="w-3 h-3 inline me-1" />Thực Đơn
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600">
              {duLieuBaoCao?.soldDishes?.length || 0} món
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Các món ăn phát sinh doanh thu</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-1.5">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-bold uppercase text-slate-500">Giá Trị TB / Lượt</span>
              <span className="badge bg-purple-subtle text-purple-800 rounded-pill px-2.5 py-1 text-xs">
                <i className="bi bi-calculator me-1"></i>TB Đơn
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">
              {duLieuBaoCao?.totalOrders > 0
                ? dinhDangTienTe(Math.round(duLieuBaoCao.totalRevenue / duLieuBaoCao.totalOrders))
                : '0 đ'}
            </div>
            <p className="text-xs text-slate-400 font-medium mb-0">Mức chi tiêu trung bình / lượt</p>
          </div>
        </div>
      </div>

      {/* Cơ cấu thanh toán & Top món bán chạy */}
      <div className="row g-4">
        {/* Cột Trái: Cơ Cấu Phương Thức Thanh Toán */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900 mb-0">
                  Cơ Cấu Phương Thức Thanh Toán
                </h3>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 text-xs">
                Theo loại tiền
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {duLieuBaoCao?.paymentBreakdown?.map((p, idx) => (
                <div key={idx} className="p-3 rounded-3 bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900 capitalize d-flex align-items-center gap-2">
                      {p.phuong_thuc_thanh_toan === 'tien_mat' ? (
                        <>
                          <i className="bi bi-cash text-success fs-5"></i>
                          <span>Tiền Mặt Trực Tiếp</span>
                        </>
                      ) : p.phuong_thuc_thanh_toan === 'chuyen_khoan' ? (
                        <>
                          <i className="bi bi-qr-code text-primary fs-5"></i>
                          <span>Chuyển Khoản VietQR / Ngân Hàng</span>
                        </>
                      ) : (
                        <span>{p.phuong_thuc_thanh_toan}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Giao dịch đã hoàn tất</div>
                  </div>
                  <div className="badge bg-amber-100 text-amber-900 px-3 py-1.5 rounded-pill text-sm fw-bold">
                    {dinhDangTienTe(p.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Phải: Top 5 Món Đóng Góp Doanh Thu Cao Nhất */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 rounded-4 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 mb-0">
                  Top 5 Món Bán Chạy Nhất
                </h3>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 text-xs">
                Doanh số cao
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {duLieuBaoCao?.topDishes?.map((mon, idx) => (
                <div key={idx} className="p-2.5 rounded-3 bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="w-6 h-6 rounded-circle bg-white border border-slate-200 text-xs font-black text-slate-800 d-flex align-items-center justify-content-center shadow-2xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{mon.ten_mon}</div>
                      <div className="text-xs text-slate-500 font-medium">Đã bán: <b className="text-slate-800">{mon.total_sold}</b> phần</div>
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

      {/* KHỐI BẢNG CHI TIẾT CỦA BÁO CÁO: CHI TIẾT MÓN ĐÃ BÁN & GIAO DỊCH */}
      <div className="card bg-white border border-slate-200 rounded-4 overflow-hidden shadow-sm">
        {/* Thanh công cụ chuyển đổi Tab chi tiết */}
        <div className="p-4 border-b border-slate-200 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-slate-50/50">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => setTabChiTiet('dishes')}
              className={`btn btn-sm rounded-3 font-bold px-3 py-2 d-flex align-items-center gap-2 transition-all ${
                tabChiTiet === 'dishes'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-outline-secondary bg-white text-slate-700'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Chi Tiết Danh Sách Món Đã Bán ({danhSachMonDaLoc.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTabChiTiet('orders')}
              className={`btn btn-sm rounded-3 font-bold px-3 py-2 d-flex align-items-center gap-2 transition-all ${
                tabChiTiet === 'orders'
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-outline-secondary bg-white text-slate-700'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>Chi Tiết Các Lượt Bán Hàng ({danhSachGiaoDichDaLoc.length})</span>
            </button>
          </div>

          {/* Ô tìm kiếm món ăn hoặc lọc phương thức thanh toán */}
          {tabChiTiet === 'dishes' ? (
            <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
              <span className="input-group-text bg-white border-slate-200 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={tuKhoaMon}
                onChange={(e) => setTuKhoaMon(e.target.value)}
                placeholder="Tìm tên món đã bán..."
                className="form-control bg-white border-slate-200 text-xs py-2"
              />
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Thanh toán:</span>
              <select
                value={locPhuongThuc}
                onChange={(e) => setLocPhuongThuc(e.target.value)}
                className="form-select form-select-sm bg-white border-slate-200 text-xs py-1.5 font-bold"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="tien_mat">Tiền mặt</option>
                <option value="chuyen_khoan">QR Chuyển khoản</option>
              </select>
            </div>
          )}
        </div>

        {/* Nội dung Tab 1: BẢNG CHI TIẾT TỪNG MÓN ĂN ĐÃ BÁN */}
        {tabChiTiet === 'dishes' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4" style={{ width: '60px' }}>#</th>
                  <th className="py-3 px-4">Tên Món Ăn</th>
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4 text-end">Đơn Giá</th>
                  <th className="py-3 px-4 text-center">Số Lượng Đã Bán</th>
                  <th className="py-3 px-4 text-end">Tổng Doanh Thu</th>
                  <th className="py-3 px-4" style={{ width: '180px' }}>Tỷ Trọng Doanh Thu</th>
                  <th className="py-3 px-4 text-end">Lần Bán Cuối</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {danhSachMonDaLoc.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400 font-semibold">
                      Chưa ghi nhận món ăn nào được bán trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : (
                  danhSachMonDaLoc.map((mon, idx) => (
                    <tr key={mon.mon_an_id || idx}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 fw-bold text-slate-900">
                        <div className="d-flex align-items-center gap-2.5">
                          {mon.hinh_anh ? (
                            <img
                              src={mon.hinh_anh}
                              alt={mon.ten_mon}
                              className="w-10 h-10 rounded-3 object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-3 bg-slate-100 flex items-center justify-center text-slate-400">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-slate-900">{mon.ten_mon}</div>
                            <div className="text-[11px] font-mono text-slate-400">ID: #{mon.mon_an_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-1 text-xs">
                          {mon.danh_muc || 'Món chính'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 text-end">
                        {dinhDangTienTe(mon.gia || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-pill font-mono font-black text-xs">
                          {mon.total_sold} phần
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-amber-600 text-end">
                        {dinhDangTienTe(mon.total_revenue || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="d-flex justify-content-between text-[11px] font-bold text-slate-600">
                            <span>{mon.revenue_share_pct || 0}%</span>
                            <span className="text-slate-400">{mon.order_count || 1} lượt</span>
                          </div>
                          <div className="w-100 bg-slate-100 rounded-pill h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-pill"
                              style={{ width: `${Math.min(100, Math.max(3, mon.revenue_share_pct || 0))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-end text-xs font-mono text-slate-500">
                        {mon.last_order_at ? new Date(mon.last_order_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {danhSachMonDaLoc.length > 0 && (
                <tfoot className="table-light font-bold text-xs">
                  <tr>
                    <td colSpan="4" className="py-3 px-4 text-uppercase">Tổng Cộng Đã Bán:</td>
                    <td className="py-3 px-4 text-center font-mono font-black text-emerald-700">
                      {danhSachMonDaLoc.reduce((acc, cur) => acc + (cur.total_sold || 0), 0)} phần
                    </td>
                    <td className="py-3 px-4 text-end font-mono font-black text-amber-700">
                      {dinhDangTienTe(danhSachMonDaLoc.reduce((acc, cur) => acc + (cur.total_revenue || 0), 0))}
                    </td>
                    <td colSpan="2" className="py-3 px-4 text-slate-400">100% doanh số thực đơn</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Nội dung Tab 2: BẢNG LỊCH SỬ GIAO DỊCH & CHI TIẾT TỪNG LƯỢT GỌI MÓN */}
        {tabChiTiet === 'orders' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4" style={{ width: '80px' }}>Mã Đơn</th>
                  <th className="py-3 px-4">Bàn Ăn</th>
                  <th className="py-3 px-4">Món Đã Bán</th>
                  <th className="py-3 px-4 text-center">Số Lượng</th>
                  <th className="py-3 px-4 text-end">Đơn Giá</th>
                  <th className="py-3 px-4 text-end">Thành Tiền</th>
                  <th className="py-3 px-4">Phương Thức Thanh Toán</th>
                  <th className="py-3 px-4 text-end">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {danhSachGiaoDichDaLoc.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400 font-semibold">
                      Chưa có giao dịch bán hàng nào trong danh sách.
                    </td>
                  </tr>
                ) : (
                  danhSachGiaoDichDaLoc.map((don) => (
                    <tr key={don.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{don.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 text-xs">
                          Bàn {don.so_ban}
                        </span>
                      </td>
                      <td className="py-3 px-4 fw-bold text-slate-900">
                        <div>{don.ten_mon}</div>
                        {don.ghi_chu && (
                          <div className="text-[11px] text-slate-400 font-normal italic">
                            Ghi chú: {don.ghi_chu}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        x{don.so_luong}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-end">
                        {dinhDangTienTe(don.don_gia || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-emerald-600 text-end">
                        {dinhDangTienTe(don.tong_tien || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {don.phuong_thuc_thanh_toan === 'tien_mat' ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 text-xs font-bold">
                            <i className="bi bi-cash me-1"></i>Tiền mặt
                          </span>
                        ) : don.phuong_thuc_thanh_toan === 'chuyen_khoan' ? (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 text-xs font-bold">
                            <i className="bi bi-qr-code me-1"></i>VietQR
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary px-2 py-1 text-xs">
                            {don.phuong_thuc_thanh_toan}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-end text-xs font-mono text-slate-500">
                        {don.createdAt ? new Date(don.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
