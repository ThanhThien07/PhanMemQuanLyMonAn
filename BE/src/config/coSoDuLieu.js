/**
 * @file coSoDuLieu.js
 * @description Cấu hình và thiết lập kết nối cơ sở dữ liệu MongoDB thông qua thư viện Mongoose ODM.
 * Hỗ trợ tự động kết nối lại, quản lý pool kết nối và ghi nhận trạng thái kết nối máy chủ.
 * @module config/coSoDuLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Chuỗi kết nối MongoDB mặc định trỏ tới localhost nếu chưa cấu hình trong biến môi trường .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/royal_bistro';

// Biến cờ theo dõi trạng thái kết nối nhằm tránh kết nối lặp lại nhiều lần
let isConnected = false;

/**
 * Hàm khởi tạo kết nối cơ sở dữ liệu MongoDB
 * @async
 * @function ketNoiCSDL
 * @returns {Promise<void>}
 */
export async function ketNoiCSDL() {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`🍃 Đã kết nối cơ sở dữ liệu MongoDB thành công: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    throw error;
  }
}

// Giữ bí danh tương thích
export const connectDB = ketNoiCSDL;

export default {
  ketNoiCSDL,
  connectDB
};
