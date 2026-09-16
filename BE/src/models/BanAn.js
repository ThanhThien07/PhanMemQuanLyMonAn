/**
 * @file BanAn.js
 * @description Lược đồ Bàn ăn (Table Schema) mô phỏng sơ đồ mặt bằng thực tế của nhà hàng.
 * Quản lý số bàn, sức chứa khách, khu vực phân bổ (Sảnh chính, Tầng 2, Sân vườn, VIP),
 * trạng thái hiện tại (trong, co_khach, da_dat), số lượng khách đang ngồi và cờ yêu cầu thanh toán.
 * @module models/BanAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const banAnSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã số bàn định danh
    so_ban: { type: Number, required: true, unique: true },     // Số thứ tự hiển thị của bàn (Bàn 1, Bàn 2...)
    suc_chua: { type: Number, default: 4 },                     // Sức chứa số ghế tối đa
    trang_thai: { 
      type: String, 
      enum: ['trong', 'co_khach', 'da_dat'], 
      default: 'trong'                                          // Trạng thái vận hành của bàn
    },
    khu_vuc: { type: String, default: 'Tầng 1 - Sảnh Chính' },  // Khu vực vị trí trong nhà hàng
    yeu_cau_thanh_toan: { type: Number, default: 0 },           // Cờ báo khách tại bàn bấm yêu cầu thanh toán
    so_luong_khach: { type: Number, default: 0 }                // Số lượng khách thực tế đang ngồi
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

export const BanAn = mongoose.models.Table || mongoose.model('Table', banAnSchema);

// Bí danh tương thích
export const Table = BanAn;

export default BanAn;
