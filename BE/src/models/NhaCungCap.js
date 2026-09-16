/**
 * @file NhaCungCap.js
 * @description Lược đồ Nhà cung cấp thực phẩm và nguyên vật liệu (Supplier Schema).
 * Lưu trữ thông tin đối tác cung ứng: mã NCC, tên công ty, số điện thoại liên hệ, email, địa chỉ kho
 * và điểm đánh giá chất lượng sản phẩm (1-5 sao).
 * @module models/NhaCungCap
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const nhaCungCapSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },           // Mã số NCC tự tăng
    ma_ncc: { type: String, required: true, unique: true, trim: true }, // Mã ký hiệu NCC (ví dụ: 'NCC-THIT-SACH')
    ten_ncc: { type: String, required: true, trim: true },     // Tên công ty / thương hiệu đối tác
    so_dien_thoai: { type: String, default: '' },              // Hotline liên hệ
    email: { type: String, default: '' },                      // Email gửi đơn đặt hàng
    dia_chi: { type: String, default: '' },                    // Địa chỉ trụ sở / kho bãi
    danh_gia_sao: { type: Number, default: 5.0 }               // Điểm đánh giá độ uy tín (sao)
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

export const NhaCungCap = mongoose.models.Supplier || mongoose.model('Supplier', nhaCungCapSchema);

// Bí danh tương thích
export const Supplier = NhaCungCap;

export default NhaCungCap;
