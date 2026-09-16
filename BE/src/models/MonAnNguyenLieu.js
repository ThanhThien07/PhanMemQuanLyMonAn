/**
 * @file MonAnNguyenLieu.js
 * @description Lược đồ Bảng Định lượng món ăn (Bill of Materials - BOM Schema).
 * Giải quyết mối quan hệ N-N giữa Món ăn (MonAn) và Nguyên liệu (NguyenLieu).
 * Quy định rõ một đĩa/phần món ăn cần tiêu hao bao nhiêu nguyên liệu (so_luong_can),
 * là cơ sở để hệ thống tự động trừ kho chính xác khi đầu bếp bấm nấu món tại KDS.
 * @module models/MonAnNguyenLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const monAnNguyenLieuSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },           // Mã định lượng tự tăng
    mon_an_id: { type: Number, required: true, index: true },   // Khóa ngoại liên kết Món ăn
    nguyen_lieu_id: { type: Number, required: true, index: true }, // Khóa ngoại liên kết Nguyên liệu
    so_luong_can: { type: Number, required: true, default: 0 }, // Định lượng tiêu hao cho 1 phần món
    don_vi_tinh: { type: String, default: 'kg' }               // Đơn vị tính định lượng
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

export const MonAnNguyenLieu = mongoose.models.DishIngredient || mongoose.model('DishIngredient', monAnNguyenLieuSchema);

// Bí danh tương thích
export const DishIngredient = MonAnNguyenLieu;

export default MonAnNguyenLieu;
