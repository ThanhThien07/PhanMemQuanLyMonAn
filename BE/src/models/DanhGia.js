/**
 * @file DanhGia.js
 * @description Lược đồ Đánh giá chất lượng dịch vụ (Review Schema).
 * Tiếp nhận phản hồi đánh giá trực tiếp từ khách hàng quét mã QR tại bàn sau bữa ăn:
 * Số sao chấm điểm (1 đến 5 sao), nội dung nhận xét góp ý và cờ cảnh báo đỏ (canh_bao_do)
 * khi khách hàng không hài lòng (dưới 3 sao) để quản lý kịp thời đến chăm sóc khách hàng tại bàn.
 * @module models/DanhGia
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const danhGiaSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã số đánh giá tự tăng
    ban_id: { type: Number, required: true, index: true },      // Bàn ăn thực hiện đánh giá
    so_sao: { type: Number, required: true, default: 5 },       // Số sao đánh giá (1 - 5 sao)
    noi_dung_danh_gia: { type: String, default: '' },           // Lời nhận xét, đóng góp ý kiến của thực khách
    canh_bao_do: { type: Number, default: 0 }                   // Cờ cảnh báo quản lý nếu đánh giá kém (<= 2 sao)
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

export const DanhGia = mongoose.models.Review || mongoose.model('Review', danhGiaSchema);

// Bí danh tương thích
export const Review = DanhGia;

export default DanhGia;
