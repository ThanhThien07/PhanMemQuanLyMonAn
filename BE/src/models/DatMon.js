/**
 * @file DatMon.js
 * @description Lược đồ Đơn gọi món (Order Schema) lưu trữ từng món ăn được gọi theo bàn.
 * Quản lý số lượng, đơn giá, thành tiền, tùy chọn chế biến (options_json), ghi chú riêng cho đầu bếp,
 * trạng thái chế biến tại bếp KDS (cho_xac_nhan -> dang_che_bien -> da_phuc_vu -> hoan_thanh),
 * phương thức thanh toán (tien_mat, chuyen_khoan) và độ ưu tiên phục vụ.
 * @module models/DatMon
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const datMonSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã đơn món tự tăng
    ban_id: { type: Number, required: true, index: true },      // Mã bàn gọi món
    mon_an_id: { type: Number, required: true, index: true },   // Mã món ăn trong thực đơn
    khach_hang_id: { type: Number, default: null, index: true },// Khách hàng thân thiết tích điểm (nếu có)
    so_luong: { type: Number, default: 1 },                     // Số lượng đĩa / phần món
    don_gia: { type: Number, default: 0 },                      // Đơn giá tại thời điểm gọi (VNĐ)
    tong_tien: { type: Number, default: 0 },                    // Thành tiền = so_luong * don_gia
    options_json: { type: String, default: '{}' },              // Tùy chọn khẩu vị (độ cay, ít đường, thêm sốt)
    ghi_chu: { type: String, default: '' },                     // Lời nhắn gửi riêng cho đầu bếp
    trang_thai: { 
      type: String, 
      enum: ['cho_xac_nhan', 'dang_che_bien', 'da_phuc_vu', 'hoan_thanh', 'da_huy'], 
      default: 'cho_xac_nhan',
      index: true
    },
    phuong_thuc_thanh_toan: { 
      type: String, 
      default: 'chua_thanh_toan',
      index: true
    },
    session_token: { type: String, default: '' },               // Mã phiên của khách quét QR
    thu_tu_uu_tien: { type: Number, default: 1 },               // Thứ tự ưu tiên chế biến (1: thường, 2: gấp)
    so_luong_khach: { type: Number, default: 0 }                // Số lượng khách tại thời điểm gọi
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

export const DatMon = mongoose.models.Order || mongoose.model('Order', datMonSchema);

// Bí danh tương thích
export const Order = DatMon;

export default DatMon;
