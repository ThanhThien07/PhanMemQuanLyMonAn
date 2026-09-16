/**
 * @file BoDem.js
 * @description Mô hình bảng đếm (Counter Schema) trong MongoDB.
 * Phục vụ sinh mã định danh số tự tăng tuần tự (Auto-increment integer ID: 1, 2, 3...)
 * cho các bộ sưu tập (Collections), đảm bảo tính tuần tự giống hệt AUTO_INCREMENT trong MySQL.
 * @module models/BoDem
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const boDemSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Tên bộ đếm (ví dụ: 'users_id', 'dishes_id', 'orders_id')
  seq: { type: Number, default: 0 }     // Giá trị tuần tự hiện tại
});

export const BoDem = mongoose.models.Counter || mongoose.model('Counter', boDemSchema);

/**
 * Hàm lấy giá trị số tuần tự tiếp theo cho một bộ sưu tập
 * @function layMaSoTiepTheo
 * @param {string} tenBoDem - Tên bộ đếm (ví dụ: 'orders_id')
 * @returns {Promise<number>} Giá trị số nguyên tuần tự tiếp theo
 */
export async function layMaSoTiepTheo(tenBoDem) {
  const banGhi = await BoDem.findByIdAndUpdate(
    tenBoDem,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, returnDocument: 'after' }
  );
  return banGhi.seq;
}

// Giữ các bí danh tương thích
export const Counter = BoDem;
export const getNextSequence = layMaSoTiepTheo;

export default BoDem;
