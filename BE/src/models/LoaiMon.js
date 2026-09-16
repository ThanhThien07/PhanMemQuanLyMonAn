/**
 * @file LoaiMon.js
 * @description Lược đồ phân loại danh mục món ăn (Category Schema) trong thực đơn nhà hàng:
 * Khai vị, Món chính, Hải sản, Tráng miệng, Đồ uống...
 * @module models/LoaiMon
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const loaiMonSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },           // Mã số danh mục tự tăng
    ma_loai: { type: String, required: true, unique: true, trim: true }, // Mã ký hiệu (ví dụ: 'KHAI_VI', 'HAI_SAN')
    ten_loai: { type: String, required: true, trim: true }     // Tên hiển thị (ví dụ: 'Khai Vị Đặc Sắc')
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

export const LoaiMon = mongoose.models.Category || mongoose.model('Category', loaiMonSchema);

// Bí danh tương thích
export const Category = LoaiMon;

export default LoaiMon;
