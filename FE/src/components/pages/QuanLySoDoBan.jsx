/**
 * @file QuanLySoDoBan.jsx
 * @description Màn hình Quản lý Sơ Đồ Bàn Ăn & Mặt Bằng Nhà Hàng (Table Management Page).
 * Tính năng chính:
 * 1. Phân loại bàn theo khu vực (Tầng 1 Sảnh chính, Tầng 2 Ban công, Phòng VIP Hoàng Gia, VIP Kim Cương).
 * 2. Đèn báo trạng thái trực quan: Trống (Xanh), Có khách (Vàng - nhấp nháy), Đã đặt (Lam).
 * 3. Hiển thị tổng tiền tạm tính và số lượng món ăn chưa thanh toán theo thời gian thực.
 * 4. Chuyển đổi trạng thái bàn nhanh chóng (Mở bàn, Dọn bàn).
 * 5. Mở Hộp thoại In Hóa Đơn (ModalInHoaDon) để thanh toán.
 * 6. Mở Popup Mã QR Bàn Ăn (sử dụng ảnh QR chuẩn nhà hàng /ma_qr.jpg) cho khách quét gọi món.
 * @module pages/QuanLySoDoBan
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import clientAxios from '../services/cauHinhAxiosApi.js';
import ModalInHoaDon from '../ModalInHoaDon.jsx';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu.js';

export default function QuanLySoDoBan({ setActiveTab }) {
  const [danhSachBan, setDanhSachBan] = useState([]);
  const [khuVucHienTai, setKhuVucHienTai] = useState('all');
  const [dangTai, setDangTai] = useState(true);
  const [banThanhToan, setBanThanhToan] = useState(null);
  const [donMonThanhToan, setDonMonThanhToan] = useState([]);
  const [banXemQR, setBanXemQR] = useState(null);

  /**
   * Tải danh sách bàn ăn từ máy chủ Back-End
   */
  const taiDanhSachBan = async () => {
    try {
      setDangTai(true);
      const phanHoi = await clientAxios.get('/tables');
      if (phanHoi.success) {
        setDanhSachBan(phanHoi.tables);
      }
    } catch (err) {
      console.error('Lỗi taiDanhSachBan:', err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSachBan();
  }, []);

  /**
   * Mở modal thanh toán hóa đơn cho bàn
   */
  const moHoaDonBan = async (ban) => {
    try {
      const phanHoi = await clientAxios.get(`/orders?ban_id=${ban.id}&unpaid_only=true`);
      if (phanHoi.success) {
        setDonMonThanhToan(phanHoi.orders);
        setBanThanhToan(ban);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Đổi trạng thái bàn ăn (Trống <-> Có khách)
   */
  const doiTrangThaiBan = async (ban, trangThaiMoi) => {
    try {
      await clientAxios.patch(`/tables/${ban.id}/status`, {
        trang_thai: trangThaiMoi,
        so_luong_khach: trangThaiMoi === 'co_khach' ? 2 : 0
      });
      taiDanhSachBan();
    } catch (err) {
      alert(err.message);
    }
  };

  const danhSachKhuVuc = ['all', 'Tầng 1 - Sảnh Chính', 'Tầng 2 - Ban Công', 'Phòng VIP 1 (Hoàng Gia)', 'Phòng VIP 2 (Kim Cương)'];
  const banDaLoc = danhSachBan.filter((b) =>
    khuVucHienTai === 'all' ? true : b.khu_vuc.includes(khuVucHienTai) || b.khu_vuc === khuVucHienTai
  );

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề & Chú giải màu sắc */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-xs">
              <i className="bi bi-grid-3x3-gap-fill me-1"></i>Sơ Đồ
            </span>
            <span className="text-xs text-slate-500 font-semibold">{banDaLoc.length} bàn trong khu vực</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Sơ Đồ Bàn Ăn & Phòng Tiệc
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Theo dõi trực quan tình trạng bàn, khách đang dùng và hóa đơn
          </p>
        </div>

        {/* Chú giải trạng thái */}
        <div className="d-flex align-items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5">
            <span className="badge bg-success rounded-circle p-1"></span>
            Trống (Sẵn sàng)
          </span>
          <span className="badge bg-warning-subtle text-amber-800 border border-warning-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5">
            <span className="badge bg-warning rounded-circle p-1 animate-ping"></span>
            Có khách
          </span>
          <span className="badge bg-info-subtle text-sky-800 border border-info-subtle px-2.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5">
            <span className="badge bg-info rounded-circle p-1"></span>
            Đã đặt trước
          </span>
        </div>
      </div>

      {/* Tabs Lọc Khu Vực sử dụng Bootstrap Button Pills */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto pb-1">
        {danhSachKhuVuc.map((khuVuc) => (
          <button
            key={khuVuc}
            onClick={() => setKhuVucHienTai(khuVuc)}
            className={`btn btn-sm rounded-pill fw-bold text-xs whitespace-nowrap transition-all ${
              khuVucHienTai === khuVuc
                ? 'btn-dark shadow-sm'
                : 'btn-outline-secondary bg-white text-slate-700'
            }`}
          >
            {khuVuc === 'all' ? 'Tất Cả Khu Vực' : khuVuc}
          </button>
        ))}
      </div>

      {/* Lưới hiển thị các bàn ăn sử dụng Bootstrap Row / Col */}
      {dangTai ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="spinner-border text-warning mb-2" role="status"></div>
          <div>Đang tải dữ liệu sơ đồ bàn...</div>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {banDaLoc.map((ban) => {
            const coKhach = ban.trang_thai === 'co_khach';
            const daDat = ban.trang_thai === 'da_dat';

            let cardBorder = 'border-slate-200 hover:border-emerald-300';
            let badgeClass = 'badge bg-success-subtle text-success border border-success-subtle';
            let nhanTrangThai = 'Trống';

            if (coKhach) {
              cardBorder = 'border-amber-300 bg-amber-50/20';
              badgeClass = 'badge bg-warning-subtle text-amber-900 border border-warning-subtle';
              nhanTrangThai = 'Đang Phục Vụ';
            } else if (daDat) {
              cardBorder = 'border-sky-300 bg-sky-50/20';
              badgeClass = 'badge bg-info-subtle text-sky-900 border border-info-subtle';
              nhanTrangThai = 'Đã Đặt';
            }

            return (
              <div key={ban.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <div
                  className={`card h-100 rounded-4 p-3.5 shadow-sm transition-all hover:shadow-md d-flex flex-column justify-content-between ${cardBorder}`}
                >
                  {/* Phần đầu thẻ bàn */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="w-8 h-8 rounded-3 bg-slate-900 text-white d-flex align-items-center justify-content-center font-black text-sm">
                          {ban.so_ban}
                        </div>
                        <span className={`px-2 py-0.5 rounded-pill text-xs fw-bold ${badgeClass}`}>
                          {nhanTrangThai}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ban.so_luong_khach || 0}/{ban.suc_chua}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-medium truncate mb-3">
                      <i className="bi bi-geo-alt me-1 text-slate-400"></i>{ban.khu_vuc}
                    </div>

                    {/* Thông tin tạm tính của bàn */}
                    {coKhach && (
                      <div className="bg-slate-50 p-2.5 rounded-3 border border-slate-100 mb-3 space-y-1">
                        <div className="d-flex justify-content-between text-xs font-semibold text-slate-600">
                          <span>Số món đang dùng:</span>
                          <span className="text-slate-900 font-bold">{ban.so_mon || 0} món</span>
                        </div>
                        <div className="d-flex justify-content-between text-xs font-semibold text-slate-600">
                          <span>Tạm tính:</span>
                          <span className="text-amber-800 font-extrabold">{dinhDangTienTe(ban.tam_tinh || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Các nút hành động thao tác bàn */}
                  <div className="space-y-2 pt-2 border-top border-slate-100">
                    <div className="row g-1.5">
                      {coKhach ? (
                        <>
                          <div className="col-6">
                            <button
                              onClick={() => moHoaDonBan(ban)}
                              className="btn btn-warning w-100 py-2 rounded-3 text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-1 shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Tính Tiền</span>
                            </button>
                          </div>

                          <div className="col-6">
                            <button
                              onClick={() => {
                                if (setActiveTab) setActiveTab('pos');
                              }}
                              className="btn btn-light border w-100 py-2 rounded-3 text-slate-700 fw-bold text-xs d-flex align-items-center justify-content-center gap-1"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Gọi Thêm</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="col-12">
                          <button
                            onClick={() => doiTrangThaiBan(ban, 'co_khach')}
                            className="btn btn-dark w-100 py-2 rounded-3 text-white fw-bold text-xs d-flex align-items-center justify-content-center gap-1 shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mở Bàn Đón Khách</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nút xem mã QR của bàn */}
                    <button
                      onClick={() => setBanXemQR(ban)}
                      className="btn btn-link text-slate-500 hover:text-slate-800 w-100 py-1 px-2 text-decoration-none text-xs fw-bold d-flex align-items-center justify-content-center gap-1.5"
                      title="Xem và quét mã QR bàn này"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mã QR Đặt Món Tại Bàn</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thanh toán Hóa đơn */}
      {banThanhToan && (
        <ModalInHoaDon
          table={banThanhToan}
          orders={donMonThanhToan}
          onClose={() => setBanThanhToan(null)}
          onSuccess={() => {
            taiDanhSachBan();
          }}
        />
      )}

      {/* Popup Xem Mã QR Bàn Ăn (Sử dụng ảnh QR chuẩn nhà hàng) */}
      {banXemQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="font-black text-lg text-slate-900">Mã QR Bàn {banXemQR.so_ban}</h3>
                <p className="text-xs text-slate-500 font-medium">{banXemQR.khu_vuc}</p>
              </div>
              <button 
                onClick={() => setBanXemQR(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khung chứa ảnh QR Code thay thế theo ảnh mẫu người dùng cung cấp */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src="/ma_qr.jpg"
                alt={`Mã QR Bàn ${banXemQR.so_ban}`}
                className="w-48 h-48 mx-auto rounded-xl shadow-md object-contain bg-white p-1 border border-slate-100"
              />
              <p className="text-[11px] text-amber-800 font-extrabold mt-2">
                Quét mã để đặt món & thanh toán bàn {banXemQR.so_ban}
              </p>
            </div>

            <div className="text-2xs text-slate-500 font-mono bg-slate-100 p-2 rounded-xl break-all">
              {window.location.origin}/?table={banXemQR.id}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  window.open(`/?table=${banXemQR.id}`, '_blank');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Trang Khách Gọi Món (Tab Mới)</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?table=${banXemQR.id}`);
                  alert('Đã sao chép link quét mã của Bàn ' + banXemQR.so_ban);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao Chép Đường Dẫn QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bí danh tương thích
export const TableManagement = QuanLySoDoBan;
