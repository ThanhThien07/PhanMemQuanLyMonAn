import React, { useState } from 'react';
import { X, Printer, Banknote, CheckCircle, QrCode } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

export default function BillModal({ table, orders, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('tien_mat');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successPaid, setSuccessPaid] = useState(false);

  const subtotal = orders.reduce((sum, item) => sum + (item.tong_tien || 0), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/orders/pay/${table.id}`, {
        phuong_thuc_thanh_toan: paymentMethod,
        discount: discountAmount
      });
      if (res.success) {
        setSuccessPaid(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
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

        {/* Bill Body */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4 text-sm font-mono bg-slate-50/50">
          <div className="text-center border-b border-dashed border-slate-300 pb-3 font-sans">
            <div className="font-black text-slate-900 text-base">NHÀ HÀNG ROYAL BISTRO</div>
            <div className="text-xs text-slate-500">120 Nguyễn Thị Minh Khai, Q.3, TP.HCM</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Ngày: {new Date().toLocaleString('vi-VN')}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            {orders.map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <span className="text-slate-900 font-bold">{item.ten_mon}</span>
                  <div className="text-slate-500">
                    {item.so_luong} x {formatCurrency(item.don_gia)}
                  </div>
                  {item.ghi_chu && <div className="text-[10px] text-amber-700 font-semibold">*{item.ghi_chu}</div>}
                </div>
                <div className="text-slate-900 font-black whitespace-nowrap">
                  {formatCurrency(item.tong_tien)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculation */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Tạm tính:</span>
              <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Giảm giá:</span>
              <div className="flex items-center gap-1">
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="bg-white text-amber-800 text-xs px-2 py-0.5 rounded-lg border border-slate-300 font-bold"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5% (VIP)</option>
                  <option value={10}>10% (Sinh Nhật)</option>
                  <option value={15}>15% (Đặc Biệt)</option>
                </select>
                <span className="font-bold text-rose-600">-{formatCurrency(discountAmount)}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-black text-amber-700 pt-2 border-t border-slate-300 font-sans">
              <span>TỔNG THANH TOÁN:</span>
              <span className="text-xl text-slate-900 font-black">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 font-sans mb-2">
              Phương thức thanh toán:
            </div>
            <div className="grid grid-cols-2 gap-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('tien_mat')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  paymentMethod === 'tien_mat'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                Tiền Mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('chuyen_khoan')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  paymentMethod === 'chuyen_khoan'
                    ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                QR Chuyển Khoản
              </button>
            </div>
          </div>

          {/* QR Code view if Transfer */}
          {paymentMethod === 'chuyen_khoan' && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center font-sans shadow-2xs">
              <div className="text-xs text-slate-700 font-bold mb-1.5">Quét mã VietQR chuyển khoản</div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=247_ROYALBISTRO_BAN${table?.so_ban}_${finalTotal}`}
                alt="QR Code"
                className="w-32 h-32 mx-auto rounded-xl border border-slate-200 p-1 bg-white shadow-xs"
              />
              <div className="text-[11px] text-amber-800 font-extrabold mt-1.5">
                Nội dung: BAN{table?.so_ban} - {formatCurrency(finalTotal)}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            In Hóa Đơn
          </button>

          <button
            disabled={loading || successPaid}
            onClick={handlePayment}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black shadow-md transition-all cursor-pointer ${
              successPaid
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {successPaid ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Đã Hoàn Tất!
              </>
            ) : loading ? (
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
