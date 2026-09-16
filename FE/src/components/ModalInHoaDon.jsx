/**
 * @file ModalInHoaDon.jsx
 * @description Hộp thoại xem chi tiết và thanh toán hóa đơn bàn ăn (Bill Modal & Checkout).
 * Hỗ trợ:
 * 1. Tính toán chi tiết các món đã dùng tại bàn, đơn giá, số lượng, thành tiền.
 * 2. Chiết khấu giảm giá phần trăm (VIP 5%, Sinh nhật 10%, Khuyến mãi 15%).
 * 3. Hỗ trợ in phiếu thanh toán bằng trình duyệt (`window.print()`).
 * 4. Hỗ trợ 2 phương thức thanh toán: Tiền mặt hoặc Quét mã VietQR chuyển khoản (sử dụng ảnh QR chuẩn của nhà hàng).
 * 5. Cập nhật giải phóng bàn và thông báo realtime cho quầy thu ngân.
 * @module components/ModalInHoaDon
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import { X, Printer, Banknote, CheckCircle, QrCode } from 'lucide-react';
import clientAxios from '../services/cauHinhAxiosApi.js';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu.js';

export default function ModalInHoaDon({ table, orders, onClose, onSuccess }) {
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState('tien_mat');
  const [phanTramGiamGia, setPhanTramGiamGia] = useState(0);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thanhToanThanhCong, setThanhToanThanhCong] = useState(false);

  const tongTamTinh = orders.reduce((tong, item) => tong + (item.tong_tien || 0), 0);
  const soTienGiamGia = Math.round((tongTamTinh * phanTramGiamGia) / 100);
  const tongTienPhaiTra = Math.max(0, tongTamTinh - soTienGiamGia);

  /**
   * Gửi yêu cầu xác nhận thanh toán hóa đơn xuống máy chủ Back-End
   */
  const xuLyThanhToan = async () => {
    try {
      setDangXuLy(true);
      const phanHoi = await clientAxios.post(`/orders/pay/${table.id}`, {
        phuong_thuc_thanh_toan: phuongThucThanhToan,
        discount: soTienGiamGia
      });
      if (phanHoi.success) {
        setThanhToanThanhCong(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Kích hoạt in hóa đơn thanh toán
   */
  const xuLyInHoaDon = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Tiêu đề Modal */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              B{table?.so_ban}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Hóa Đơn Thanh Toán</h3>
              <p className="text-xs text-slate-500 font-medium">{table?.khu_vuc} • {orders.length} món</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Phiếu Hóa Đơn */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4 text-sm font-mono bg-slate-50/50">
          <div className="text-center border-b border-dashed border-slate-300 pb-3 font-sans">
            <div className="font-black text-slate-900 text-base">NHÀ HÀNG ROYAL BISTRO</div>
            <div className="text-xs text-slate-500">120 Nguyễn Thị Minh Khai, Q.3, TP.HCM</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Ngày in: {new Date().toLocaleString('vi-VN')}
            </div>
          </div>

          {/* Danh sách các món ăn */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            {orders.map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <span className="text-slate-900 font-bold">{item.ten_mon}</span>
                  <div className="text-slate-500">
                    {item.so_luong} x {dinhDangTienTe(item.don_gia)}
                  </div>
                  {item.ghi_chu && <div className="text-[10px] text-amber-700 font-semibold">*{item.ghi_chu}</div>}
                </div>
                <div className="text-slate-900 font-black whitespace-nowrap">
                  {dinhDangTienTe(item.tong_tien)}
                </div>
              </div>
            ))}
          </div>

          {/* Bảng tính tổng tiền & Chiết khấu */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Tạm tính:</span>
              <span className="font-bold text-slate-800">{dinhDangTienTe(tongTamTinh)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Giảm giá:</span>
              <div className="flex items-center gap-1">
                <select
                  value={phanTramGiamGia}
                  onChange={(e) => setPhanTramGiamGia(Number(e.target.value))}
                  className="bg-white text-amber-800 text-xs px-2 py-0.5 rounded-lg border border-slate-300 font-bold"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5% (Khách VIP)</option>
                  <option value={10}>10% (Sinh Nhật)</option>
                  <option value={15}>15% (Đặc Biệt)</option>
                </select>
                <span className="font-bold text-rose-600">-{dinhDangTienTe(soTienGiamGia)}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-black text-amber-700 pt-2 border-t border-slate-300 font-sans">
              <span>TỔNG THANH TOÁN:</span>
              <span className="text-xl text-slate-900 font-black">{dinhDangTienTe(tongTienPhaiTra)}</span>
            </div>
          </div>

          {/* Lựa chọn phương thức thanh toán */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 font-sans mb-2">
              Phương thức thanh toán:
            </div>
            <div className="grid grid-cols-2 gap-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => setPhuongThucThanhToan('tien_mat')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  phuongThucThanhToan === 'tien_mat'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                Tiền Mặt
              </button>
              <button
                type="button"
                onClick={() => setPhuongThucThanhToan('chuyen_khoan')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  phuongThucThanhToan === 'chuyen_khoan'
                    ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                QR Chuyển Khoản
              </button>
            </div>
          </div>

          {/* Hiển thị Mã QR Thanh Toán (Sử dụng ảnh QR chuẩn nhà hàng) */}
          {phuongThucThanhToan === 'chuyen_khoan' && (
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center font-sans shadow-sm">
              <div className="text-xs text-slate-800 font-black mb-2 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                Quét mã VietQR chuyển khoản trực tiếp
              </div>
              <img
                src="/ma_qr.jpg"
                alt="Mã QR Chuyển Khoản"
                className="w-40 h-40 mx-auto rounded-xl border border-slate-200 p-1 bg-white shadow-md object-contain"
              />
              <div className="text-[12px] text-amber-800 font-extrabold mt-2">
                Nội dung CK: BAN{table?.so_ban} - {dinhDangTienTe(tongTienPhaiTra)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ tất cả ứng dụng Ngân hàng & Ví điện tử Napas247</p>
            </div>
          )}
        </div>

        {/* Nút hành động chân trang */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={xuLyInHoaDon}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            In Hóa Đơn
          </button>

          <button
            disabled={dangXuLy || thanhToanThanhCong}
            onClick={xuLyThanhToan}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black shadow-md transition-all cursor-pointer ${
              thanhToanThanhCong
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {thanhToanThanhCong ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Đã Hoàn Tất!
              </>
            ) : dangXuLy ? (
              'Đang xử lý...'
            ) : (
              'Xác Nhận Thanh Toán'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const BillModal = ModalInHoaDon;
