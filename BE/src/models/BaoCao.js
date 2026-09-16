/**
 * @file BaoCao.js
 * @description Lược đồ Báo cáo doanh thu & Kết toán ca (Report Schema).
 * Quản lý biên bản chốt sổ kinh doanh theo ngày hoặc theo ca làm việc (Ca Sáng, Ca Chiều, Ca Tối),
 * tổng số hóa đơn thanh toán, tổng lượng khách phục vụ, tổng doanh thu thực thu,
 * phân tích cơ cấu doanh thu theo tiền mặt và chuyển khoản VietQR Napas247.
 * @module models/BaoCao
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const baoCaoSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã số báo cáo tự tăng
    ma_bao_cao: { type: String, required: true, unique: true, trim: true }, // Ký hiệu biên bản (ví dụ: 'BC-2026-09-15-CA1')
    ngay_lap: { type: Date, default: Date.now },                // Thời điểm lập biên bản chốt ca
    nguoi_lap: { type: String, required: true },                // Thu ngân hoặc quản lý thực hiện chốt ca
    ca_lam_viec: { type: String, default: 'Ca Sáng' },          // Ca làm việc: 'Ca Sáng', 'Ca Chiều', 'Ca Tối'
    tong_so_hoa_don: { type: Number, default: 0 },              // Tổng số bàn đã thanh toán trong ca
    tong_luong_khach: { type: Number, default: 0 },             // Tổng số khách hàng đã tiếp đón
    tong_doanh_thu: { type: Number, default: 0 },               // Doanh thu tổng kết (VNĐ)
    doanh_thu_tien_mat: { type: Number, default: 0 },           // Doanh thu thu tiền mặt trực tiếp
    doanh_thu_chuyen_khoan: { type: Number, default: 0 }        // Doanh thu nhận qua quét mã chuyển khoản VietQR
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.id && ret._id) ret.id = ret._id;
        return ret;
      }
    }
  }
);

export const BaoCao = mongoose.models.Report || mongoose.model('Report', baoCaoSchema);

// Bí danh tương thích
export const Report = BaoCao;

export default BaoCao;
