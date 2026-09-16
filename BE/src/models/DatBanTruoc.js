/**
 * @file DatBanTruoc.js
 * @description Lược đồ Quản lý lịch Đặt bàn trước (Reservation Schema).
 * Tiếp nhận thông tin khách hàng đặt tiệc/hẹn trước ngày giờ (thoi_gian_hen), số lượng khách dự kiến,
 * bàn được chỉ định (ban_id), số tiền cọc (tien_coc), ghi chú đặc biệt và trạng thái phiếu (da_xac_nhan -> da_den / da_huy).
 * @module models/DatBanTruoc
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const datBanTruocSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã số phiếu đặt tự tăng
    ma_reservation: { type: String, required: true, unique: true, trim: true }, // Mã code đặt bàn (ví dụ: 'RES-8901')
    ten_khach: { type: String, required: true, trim: true },    // Tên khách hàng đại diện
    sdt: { type: String, required: true, trim: true },          // Số điện thoại nhận tin nhắn
    ban_id: { type: Number, default: null, index: true },       // Mã bàn được gán giữ chỗ
    thoi_gian_hen: { type: Date, required: true },              // Thời điểm khách hẹn đến dùng bữa
    so_luong_khach: { type: Number, default: 2 },               // Số khách đi cùng
    tien_coc: { type: Number, default: 0 },                     // Số tiền đặt cọc giữ bàn (VNĐ)
    trang_thai: { 
      type: String, 
      enum: ['da_xac_nhan', 'da_den', 'da_huy'], 
      default: 'da_xac_nhan',
      index: true
    },
    ghi_chu: { type: String, default: '' }                      // Ghi chú chuẩn bị bàn, hoa tươi, tiệc sinh nhật...
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

export const DatBanTruoc = mongoose.models.Reservation || mongoose.model('Reservation', datBanTruocSchema);

// Bí danh tương thích
export const Reservation = DatBanTruoc;

export default DatBanTruoc;
