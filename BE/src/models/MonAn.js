/**
 * @file MonAn.js
 * @description Lược đồ Món ăn (Dish Schema) trong hệ thống thực đơn nhà hàng.
 * Quản lý tên món, thuộc danh mục nào (loai_mon_id), giá bán niêm yết, mô tả hương vị,
 * link hình ảnh món ăn và trạng thái sẵn sàng phục vụ (con_hang / het_hang).
 * @module models/MonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const monAnSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },      // Mã số định danh món ăn
    loai_mon_id: { type: Number, default: null, index: true }, // Khóa liên kết tới danh mục LoaiMon
    ten_mon: { type: String, required: true, trim: true },// Tên món ăn
    gia: { type: Number, required: true, default: 0 },    // Đơn giá bán (VNĐ)
    mo_ta: { type: String, default: '' },                 // Mô tả thành phần, khẩu vị
    hinh_anh: { type: String, default: '' },              // Đường dẫn hình ảnh món ăn
    trang_thai: { 
      type: String, 
      enum: ['con_hang', 'tam_ngung', 'het_hang'], 
      default: 'con_hang'                                 // Trạng thái phục vụ
    }
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

export const MonAn = mongoose.models.Dish || mongoose.model('Dish', monAnSchema);

// Bí danh tương thích
export const Dish = MonAn;

export default MonAn;
