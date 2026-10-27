/**
 * @file BaoCaoThongKeDoanhThu.jsx
 * @description Màn hình Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh chi tiết của nhà hàng Royal Bistro.
 * Tính năng chính:
 * 1. Dòng tiêu đề to dài dàn đều, loại bỏ toàn bộ chữ nhỏ rườm rà.
 * 2. Thanh công cụ tra cứu lịch sử ở hàng bên dưới: chọn ngày/tháng/năm cụ thể, các mốc thời gian nhanh.
 * 3. Chức năng xuất file Excel/CSV chuẩn UTF-8 và chức năng xuất báo cáo tuần (7 ngày) ra Excel.
 * 4. Sơ đồ doanh thu trực quan theo từng ngày (Daily Revenue Timeline Chart).
 * 5. Bảng chi tiết món ăn đã bán và lượt bán hàng chuẩn Layered Depth 3 tầng, không rớt dòng chữ.
 * @module pages/BaoCaoThongKeDoanhThu
 * @author Nguyễn Hoàng Hưng
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
  FileSpreadsheet,
  Clock,
  BarChart3
} from 'lucide-react';
import { dinhDangTienTe, dinhDangNgayGio } from '../utils/dinhDangDuLieu';
import { useToast } from '../context/ThongBaoToastContext';

export default function BaoCaoThongKeDoanhThu() {
  const toast = useToast();
  // Dữ liệu báo cáo tổng hợp từ backend
  const [duLieuBaoCao, setDuLieuBaoCao] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  // Chế độ lọc: 'preset' | 'date' | 'month_year'
  const [cheDoLoc, setCheDoLoc] = useState('preset');
  // Khoảng thời gian preset ('all', 'today', '7days', 'month')
  const [khoangThoiGian, setKhoangThoiGian] = useState('all');
  // Ngày cụ thể (YYYY-MM-DD)
  const [ngayCuThe, setNgayCuThe] = useState(() => new Date().toISOString().split('T')[0]);
  // Tháng & Năm cụ thể
  const [thangChon, setThangChon] = useState(() => new Date().getMonth() + 1);
  const [namChon, setNamChon] = useState(() => new Date().getFullYear());

  // Từ khóa tìm kiếm món ăn đã bán
  const [tuKhoaMon, setTuKhoaMon] = useState('');
  // Bộ lọc phương thức thanh toán cho danh sách giao dịch
  const [locPhuongThuc, setLocPhuongThuc] = useState('all');
  // Tab hiển thị chi tiết ('dishes' | 'orders')
  const [tabChiTiet, setTabChiTiet] = useState('dishes');

  /**
   * Tải số liệu báo cáo doanh thu từ máy chủ backend
   */
  const taiDuLieuBaoCao = async (params = {}) => {
    try {
      setDangTai(true);
      let queryStr = '';
      if (params.date) {
        queryStr = `date=${params.date}`;
      } else if (params.month && params.year) {
        queryStr = `month=${params.month}&year=${params.year}`;
      } else {
        queryStr = `range=${params.range || khoangThoiGian}`;
      }

      const res = await axiosApi.get(`/reports/summary?${queryStr}`);
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
    if (cheDoLoc === 'preset') {
      taiDuLieuBaoCao({ range: khoangThoiGian });
    } else if (cheDoLoc === 'date') {
      taiDuLieuBaoCao({ date: ngayCuThe });
    } else if (cheDoLoc === 'month_year') {
      taiDuLieuBaoCao({ month: thangChon, year: namChon });
    }
  }, [cheDoLoc, khoangThoiGian, ngayCuThe, thangChon, namChon]);

  // Danh sách các món ăn đã bán sau khi lọc tìm kiếm
  const danhSachMonDaLoc = useMemo(() => {
    const list = duLieuBaoCao?.soldDishes || [];
    if (!tuKhoaMon.trim()) return list;
    const kw = tuKhoaMon.toLowerCase();
    return list.filter((m) =>
      m.ten_mon.toLowerCase().includes(kw) ||
      (m.danh_muc && m.danh_muc.toLowerCase().includes(kw)) ||
      String(m.mon_an_id).includes(kw)
    );
  }, [duLieuBaoCao, tuKhoaMon]);

  // Danh sách giao dịch đơn hàng sau khi lọc
  const danhSachGiaoDichDaLoc = useMemo(() => {
    const list = duLieuBaoCao?.detailedOrders || [];
    if (locPhuongThuc === 'all') return list;
    return list.filter((d) => d.phuong_thuc_thanh_toan === locPhuongThuc);
  }, [duLieuBaoCao, locPhuongThuc]);

  /**
   * Xuất báo cáo dữ liệu dạng tệp Excel / CSV chuẩn UTF-8
   */
  const xuLyXuatBaoCao = (danhSachXuat = duLieuBaoCao?.soldDishes || [], tenFilePrefix = 'BaoCao_DoanhThu') => {
    try {
      if (danhSachXuat.length === 0) {
        toast.canhBao('Chưa có dữ liệu bán hàng để xuất file!', 'Thông Báo');
        return;
      }

      let csvContent = '\uFEFF';
      csvContent += 'BÁO CÁO DOANH THU & CHI TIẾT MÓN ĂN ĐÃ BÁN - ROYAL BISTRO RESTAURANT\r\n';
      csvContent += `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}\r\n`;
      csvContent += `Bộ lọc áp dụng: ${cheDoLoc === 'date' ? `Ngày ${ngayCuThe}` : cheDoLoc === 'month_year' ? `Tháng ${thangChon}/${namChon}` : `Mốc ${khoangThoiGian}`}\r\n`;
      csvContent += `Tổng doanh số: ${duLieuBaoCao?.totalRevenue || 0} VND\r\n\r\n`;

      csvContent += 'STT,Mã Món,Tên Món Ăn,Danh Mục,Đơn Giá (VND),Số Lượng Đã Bán (Phần),Tổng Doanh Thu (VND),Tỷ Trọng (%)\r\n';

      danhSachXuat.forEach((m, idx) => {
        csvContent += `${idx + 1},"${m.mon_an_id}","${m.ten_mon}","${m.danh_muc || 'Món chính'}",${m.gia},${m.total_sold},${m.total_revenue},${m.revenue_share_pct}%\r\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tenFilePrefix}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.thanhCong('Đã tải xuống file báo cáo Excel (CSV) thành công!', 'Xuất Báo Cáo');
    } catch (err) {
      toast.loi('Lỗi khi xuất file báo cáo: ' + err.message, 'Lỗi');
    }
  };

  /**
   * Tự động xuất báo cáo tuần (7 ngày gần nhất) thành file Excel
   */
  const xuLyXuatBaoCaoTuan = async () => {
    try {
      toast.thongTin('Đang tạo báo cáo tổng hợp 1 tuần gần nhất...', 'Xuất Báo Cáo Tuần');
      const res = await axiosApi.get('/reports/summary?range=7days');
      if (res.success && res.summary?.soldDishes) {
        xuLyXuatBaoCao(res.summary.soldDishes, 'BaoCao_DoanhThu_1Tuan_RoyalBistro');
      } else {
        toast.canhBao('Không có dữ liệu phát sinh trong tuần này.', 'Thông Báo');
      }
    } catch (err) {
      toast.loi('Lỗi khi xuất báo cáo tuần: ' + err.message, 'Lỗi');
    }
  };

  // Tính giá trị doanh thu cao nhất theo ngày để vẽ biểu đồ cột tỷ lệ
  const maxDailyRevenue = useMemo(() => {
    const list = duLieuBaoCao?.dailyRevenue || [];
    if (list.length === 0) return 1;
    return Math.max(...list.map(d => d.revenue), 1);
  }, [duLieuBaoCao]);

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* 1. DÒNG TIÊU ĐỀ TO TRẢI DÀI HẲN RA (FULL WIDTH) - BỎ TOÀN BỘ CHỮ NHỎ RƯỜM RÀ */}
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-0">
          Báo Cáo Doanh Thu & Chi Tiết Món Đã Bán
        </h1>
      </div>

      {/* 2. THANH CÔNG CỤ TRA CỨU LỊCH SỬ Ở HÀNG DƯỚI (CHỌN TỪNG NGÀY THÁNG NĂM & XUẤT EXCEL) */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Nhóm bộ lọc thời gian */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Các nút chọn khoảng thời gian nhanh */}
            <div className="btn-group btn-group-sm bg-slate-100 p-1 rounded-pill border border-slate-200" role="group">
              {[
                { id: 'all', label: 'Toàn Bộ' },
                { id: 'today', label: 'Hôm Nay' },
                { id: '7days', label: '7 Ngày' },
                { id: 'month', label: 'Tháng Này' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setCheDoLoc('preset');
                    setKhoangThoiGian(btn.id);
                  }}
                  className={`btn btn-sm rounded-pill font-bold px-3 py-1.5 transition-all text-xs whitespace-nowrap ${
                    cheDoLoc === 'preset' && khoangThoiGian === btn.id
                      ? 'btn-primary text-white shadow-xs'
                      : 'btn-light bg-transparent text-slate-600 border-0 hover:bg-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Chọn xem theo từng ngày cụ thể */}
            <div className="flex items-center gap-1.5 bg-slate-50 border-2 border-slate-200/90 rounded-pill px-3 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-600 whitespace-nowrap">Chọn ngày:</span>
              <input
                type="date"
                value={ngayCuThe}
                onChange={(e) => {
                  setNgayCuThe(e.target.value);
                  setCheDoLoc('date');
                }}
                className="bg-transparent border-0 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* Chọn theo Tháng & Năm */}
            <div className="flex items-center gap-1.5 bg-slate-50 border-2 border-slate-200/90 rounded-pill px-3 py-1 text-xs">
              <span className="font-bold text-slate-600 whitespace-nowrap">Tháng:</span>
              <select
                value={thangChon}
                onChange={(e) => {
                  setThangChon(Number(e.target.value));
                  setCheDoLoc('month_year');
                }}
                className="bg-transparent border-0 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              <select
                value={namChon}
                onChange={(e) => {
                  setNamChon(Number(e.target.value));
                  setCheDoLoc('month_year');
                }}
                className="bg-transparent border-0 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nhóm nút xuất file Excel / CSV */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút 1-click xuất báo cáo tuần ra file Excel */}
            <button
              type="button"
              onClick={xuLyXuatBaoCaoTuan}
              className="btn btn-outline-success bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-2 border-emerald-300 font-bold px-3 py-1.5 rounded-pill d-flex align-items-center gap-1.5 text-xs shadow-2xs transition-all whitespace-nowrap cursor-pointer"
              title="Cứ 1 tuần tự động xuất toàn bộ số liệu sang file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo Tuần Excel</span>
            </button>

            {/* Nút xuất bảng hiện tại ra Excel / CSV */}
            <button
              type="button"
              onClick={() => xuLyXuatBaoCao(duLieuBaoCao?.soldDishes || [])}
              className="btn btn-primary px-3 py-1.5 rounded-pill font-bold d-flex align-items-center gap-1.5 text-xs shadow-xs hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
              title="Xuất bảng chi tiết món ăn ra Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel / CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. THẺ CHỈ SỐ TỔNG QUAN (KPI CARDS) - LIỀN CHỮ "đ" KHÔNG RỚT DÒNG */}
      <div className="row g-3 g-md-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all hover:-translate-y-1 space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-black uppercase text-slate-600 whitespace-nowrap text-nowrap">Tổng Doanh Thu</span>
              <span className="badge bg-amber-50 text-amber-800 border-2 border-amber-200 rounded-pill px-3 py-1 text-xs font-black whitespace-nowrap text-nowrap">
                <i className="bi bi-cash-stack me-1"></i>Đã Thu
              </span>
            </div>
            {/* Ký hiệu 'đ' nằm cùng hàng, tuyệt đối không rớt dòng */}
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums whitespace-nowrap text-nowrap truncate">
              {dinhDangTienTe(duLieuBaoCao?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-slate-500 font-bold mb-0 whitespace-nowrap text-nowrap truncate">Hóa đơn thanh toán hoàn tất</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all hover:-translate-y-1 space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-black uppercase text-slate-600 whitespace-nowrap text-nowrap">Tổng Đơn Phục Vụ</span>
              <span className="badge bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-pill px-3 py-1 text-xs font-black whitespace-nowrap text-nowrap">
                <i className="bi bi-bag-check me-1"></i>Đơn Hàng
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums whitespace-nowrap text-nowrap truncate">
              {`${duLieuBaoCao?.totalOrders || 0}\u00A0lượt`}
            </div>
            <p className="text-xs text-slate-500 font-bold mb-0 whitespace-nowrap text-nowrap truncate">Các lượt gọi món thành công</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all hover:-translate-y-1 space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-black uppercase text-slate-600 whitespace-nowrap text-nowrap">Số Loại Món Đã Bán</span>
              <span className="badge bg-blue-50 text-blue-800 border-2 border-blue-200 rounded-pill px-3 py-1 text-xs font-black whitespace-nowrap text-nowrap">
                <UtensilsCrossed className="w-3 h-3 inline me-1" />Thực Đơn
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums whitespace-nowrap text-nowrap truncate">
              {`${duLieuBaoCao?.soldDishes?.length || 0}\u00A0món`}
            </div>
            <p className="text-xs text-slate-500 font-bold mb-0 whitespace-nowrap text-nowrap truncate">Các món phát sinh doanh số</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all hover:-translate-y-1 space-y-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-xs font-black uppercase text-slate-600 whitespace-nowrap text-nowrap">Giá Trị TB / Lượt</span>
              <span className="badge bg-purple-50 text-purple-800 border-2 border-purple-200 rounded-pill px-3 py-1 text-xs font-black whitespace-nowrap text-nowrap">
                <i className="bi bi-calculator me-1"></i>TB Đơn
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums whitespace-nowrap text-nowrap truncate">
              {duLieuBaoCao?.totalOrders > 0
                ? dinhDangTienTe(Math.round(duLieuBaoCao.totalRevenue / duLieuBaoCao.totalOrders))
                : '0\u00A0đ'}
            </div>
            <p className="text-xs text-slate-500 font-bold mb-0 whitespace-nowrap text-nowrap truncate">Mức chi tiêu trung bình / lượt</p>
          </div>
        </div>
      </div>

      {/* 4. SƠ ĐỒ DOANH THU THEO TỪNG NGÀY (DAILY REVENUE TIMELINE CHART) */}
      {duLieuBaoCao?.dailyRevenue && duLieuBaoCao.dailyRevenue.length > 0 && (
        <div className="card bg-white border-2 border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900 mb-0">
                Sơ Đồ Tăng Trưởng Doanh Thu
              </h3>
            </div>
            <span className="badge bg-blue-50 text-blue-800 border border-blue-200 rounded-pill px-3 py-1 text-xs font-black">
              Biểu Đồ Theo Ngày
            </span>
          </div>

          <div className="pt-2">
            <div className="h-44 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-2 pt-4 px-1">
              {duLieuBaoCao.dailyRevenue.map((d, idx) => {
                const pct = Math.max(12, Math.round((d.revenue / maxDailyRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-[56px] flex flex-col items-center gap-1.5 group">
                    <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {dinhDangTienTe(d.revenue)}
                    </div>
                    <div className="w-full bg-slate-100 rounded-xl h-28 flex items-end p-1">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-lg transition-all duration-500 group-hover:from-blue-700 group-hover:to-indigo-600 shadow-2xs"
                        style={{ height: `${pct}%` }}
                        title={`Ngày ${d.date}: ${dinhDangTienTe(d.revenue)} (${d.count} đơn)`}
                      ></div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 truncate max-w-[56px]">
                      {d.date.split('-').slice(1).join('/')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. CƠ CẤU THANH TOÁN & TOP 5 MÓN BÁN CHẠY (TIÊU ĐỀ GỌN GÀNG, KHÔNG RỚT DÒNG) */}
      <div className="row g-4">
        {/* Phương Thức Thanh Toán */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900 mb-0 whitespace-nowrap truncate">
                  Phương Thức Thanh Toán
                </h3>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 text-xs whitespace-nowrap">
                Theo loại tiền
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {duLieuBaoCao?.paymentBreakdown?.map((p, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/90 border-2 border-slate-200/90 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all d-flex align-items-center justify-content-between">
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
                  <div className="badge bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-pill text-sm fw-bold whitespace-nowrap">
                    {dinhDangTienTe(p.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Món Bán Chạy Nhất */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 mb-0 whitespace-nowrap truncate">
                  Top 5 Món Bán Chạy Nhất
                </h3>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 text-xs whitespace-nowrap">
                Doanh số cao
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {duLieuBaoCao?.topDishes?.map((mon, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/90 border-2 border-slate-200/90 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="w-7 h-7 rounded-circle bg-white border-2 border-slate-200 text-xs font-black text-slate-800 d-flex align-items-center justify-content-center shadow-2xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">{mon.ten_mon}</div>
                      <div className="text-xs text-slate-500 font-medium">Đã bán: <b className="text-slate-800">{mon.total_sold}</b> phần</div>
                    </div>
                  </div>
                  <div className="text-sm font-black text-emerald-600 whitespace-nowrap">
                    {dinhDangTienTe(mon.total_revenue || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. KHỐI BẢNG CHI TIẾT: TAB MÓN ĐÃ BÁN & GIAO DỊCH (LOẠI BỎ Ô INPUT RỖNG, Ô TÌM KIẾM ĐẸP MẮT) */}
      <div className="card bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Thanh công cụ chuyển đổi Tab chi tiết */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-slate-50/50">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              onClick={() => setTabChiTiet('dishes')}
              className={`px-3.5 py-2 rounded-pill font-bold d-flex align-items-center justify-content-center gap-1.5 transition-all text-xs whitespace-nowrap cursor-pointer border-2 ${
                tabChiTiet === 'dishes'
                  ? 'bg-blue-600 text-white shadow-xs border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-400'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span>Món Đã Bán ({danhSachMonDaLoc.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTabChiTiet('orders')}
              className={`px-3.5 py-2 rounded-pill font-bold d-flex align-items-center justify-content-center gap-1.5 transition-all text-xs whitespace-nowrap cursor-pointer border-2 ${
                tabChiTiet === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-400'
              }`}
            >
              <ReceiptText className="w-4 h-4 shrink-0" />
              <span>Lượt Bán Hàng ({danhSachGiaoDichDaLoc.length})</span>
            </button>
          </div>

          {/* Ô TÌM KIẾM CHUẨN: CÓ ICON KÍNH LÚP, PLACEHOLDER RÕ RÀNG, BO TRÒN VIÊN THUỐC */}
          {tabChiTiet === 'dishes' ? (
            <div className="relative w-100 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tuKhoaMon}
                onChange={(e) => setTuKhoaMon(e.target.value)}
                placeholder="Tìm theo tên món hoặc mã món..."
                className="w-full pl-9 pr-4 py-2 bg-white border-2 border-slate-200/90 rounded-pill text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs transition-all"
              />
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Hình thức:</span>
              <select
                value={locPhuongThuc}
                onChange={(e) => setLocPhuongThuc(e.target.value)}
                className="form-select form-select-sm bg-white border-2 border-slate-200/90 rounded-pill text-xs py-1.5 px-3 font-bold cursor-pointer"
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
          <div className="table-responsive overflow-x-auto">
            <table className="table table-hover align-middle mb-0 w-full min-w-[920px]">
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
                              width="40"
                              height="40"
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200">
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
                        <span className="badge bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2.5 py-1 text-xs rounded-pill">
                          {mon.danh_muc || 'Món chính'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 text-end whitespace-nowrap">
                        {dinhDangTienTe(mon.gia || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-pill font-mono font-black text-xs">
                          {mon.total_sold} phần
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-amber-600 text-end whitespace-nowrap">
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
                      <td className="py-3 px-4 text-end text-xs font-mono text-slate-500 whitespace-nowrap">
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
                    <td className="py-3 px-4 text-end font-mono font-black text-amber-700 whitespace-nowrap">
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
          <div className="table-responsive overflow-x-auto">
            <table className="table table-hover align-middle mb-0 w-full min-w-[960px]">
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
                        <span className="badge bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 text-xs rounded-pill">
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
                      <td className="py-3 px-4 font-mono text-slate-600 text-end whitespace-nowrap">
                        {dinhDangTienTe(don.don_gia || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-emerald-600 text-end whitespace-nowrap">
                        {dinhDangTienTe(don.tong_tien || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {don.phuong_thuc_thanh_toan === 'tien_mat' ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 text-xs font-bold rounded-pill">
                            <i className="bi bi-cash me-1"></i>Tiền mặt
                          </span>
                        ) : don.phuong_thuc_thanh_toan === 'chuyen_khoan' ? (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 text-xs font-bold rounded-pill">
                            <i className="bi bi-qr-code me-1"></i>VietQR
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1 text-xs rounded-pill">
                            {don.phuong_thuc_thanh_toan}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-end text-xs font-mono text-slate-500 whitespace-nowrap">
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
