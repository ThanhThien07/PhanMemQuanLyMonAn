/**
 * @file KhachHang.js
 * @description Lược đồ Quản lý Khách hàng thân thiết & CRM (Customer Schema).
 * Quản lý họ tên khách, số điện thoại định danh, email, điểm tích lũy thưởng (diem_tich_luy),
 * phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) và tổng chi tiêu lũy kế tại nhà hàng.
 * Phục vụ chính sách ưu đãi giảm giá và chăm sóc khách hàng VIP.
 * @module models/KhachHang
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const khachHangSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã khách hàng tự tăng
    ho_ten: { type: String, required: true, trim: true },       // Họ và tên khách hàng
    so_dien_thoai: { type: String, required: true, unique: true, trim: true }, // Số điện thoại định danh thành viên
    email: { type: String, default: '' },                       // Email nhận thư cảm ơn và voucher
    diem_tich_luy: { type: Number, default: 0 },                // Điểm thưởng tích lũy (100.000 VNĐ = 1 điểm)
    hang_thanh_vien: { type: String, default: 'Dong' },         // Hạng thẻ: 'Dong', 'Bac', 'Vang', 'KimCuong'
    tong_chi_tieu: { type: Number, default: 0 }                 // Tổng số tiền đã thanh toán từ trước đến nay
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

export const KhachHang = mongoose.models.Customer || mongoose.model('Customer', khachHangSchema);

// Bí danh tương thích
export const Customer = KhachHang;

export default KhachHang;
