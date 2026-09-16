/**
 * @file NguoiDung.js
 * @description Lược đồ Quản lý Tài khoản Người dùng & Nhân sự nhà hàng (User Schema).
 * Quản lý thông tin đăng nhập: họ tên nhân viên, địa chỉ email duy nhất, mật khẩu đã được băm an toàn bằng Bcrypt,
 * phân quyền vai trò ('admin', 'nhan_vien', 'bep', 'thu_ngan'), số điện thoại liên lạc
 * và trạng thái tài khoản ('hoat_dong' hoặc 'tam_khoa').
 * Khi chuyển sang định dạng JSON, trường mật khẩu nhạy cảm tự động bị loại bỏ hoàn toàn.
 * @module models/NguoiDung
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';

const nguoiDungSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },            // Mã số nhân viên tự tăng
    name: { type: String, required: true, trim: true },         // Họ tên đầy đủ của nhân viên
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Email đăng nhập hệ thống
    password: { type: String, required: true },                 // Mật khẩu đã mã hóa Bcrypt Hash
    role: { 
      type: String, 
      enum: ['admin', 'nhan_vien', 'bep', 'thu_ngan'], 
      default: 'nhan_vien'                                      // Vai trò phân quyền RBAC
    },
    so_dien_thoai: { type: String, default: '' },              // Số điện thoại nhân sự
    trang_thai: { 
      type: String, 
      enum: ['hoat_dong', 'tam_khoa'], 
      default: 'hoat_dong'                                      // Trạng thái tài khoản
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password; // Tuyệt đối không để lộ chuỗi băm mật khẩu ra ngoài Client
        if (!ret.id && ret._id) ret.id = ret._id;
        return ret;
      }
    }
  }
);

export const NguoiDung = mongoose.models.User || mongoose.model('User', nguoiDungSchema);

// Bí danh tương thích
export const User = NguoiDung;

export default NguoiDung;
