/**
 * @file NguyenLieu.js
 * @description Lược đồ Quản lý Nguyên vật liệu kho (Ingredient Schema).
 * Quản lý tên nguyên liệu (thịt bò Wagyu, cá hồi, tôm, phô mai...), đơn vị tính (kg, gram, lon, chai),
 * số lượng tồn kho thực tế, đơn giá nhập trung bình, định mức tồn kho tối thiểu (cảnh báo cạn kiệt)
 * và hạn sử dụng của nguyên liệu.
 * @module models/NguyenLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const nguyenLieuSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã nguyên liệu tự tăng
    ten_nguyen_lieu: { type: String, required: true, trim: true }, // Tên nguyên liệu
    don_vi_tinh: { type: String, default: 'kg' },               // Đơn vị tính (kg, chai, gói, lít)
    so_luong_ton: { type: Number, default: 0 },                 // Tồn kho hiện có
    gia_nhap_trung_binh: { type: Number, default: 0 },          // Đơn giá nhập bình quân
    dinh_muc_toi_thieu: { type: Number, default: 5 },           // Ngưỡng tối thiểu báo động cạn kho
    han_su_dung: { type: Date }                                 // Hạn sử dụng của nguyên liệu
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.id && ret._id) ret.id = ret._id;
        ret.is_low_stock = ret.so_luong_ton <= ret.dinh_muc_toi_thieu ? 1 : 0;
        return ret;
      }
    }
  }
);

export const NguyenLieu = mongoose.models.Ingredient || mongoose.model('Ingredient', nguyenLieuSchema);

// Bí danh tương thích
export const Ingredient = NguyenLieu;

export default NguyenLieu;
