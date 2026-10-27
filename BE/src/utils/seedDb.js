/**
 * @file seedDb.js
 * @description Entry-point script phục vụ lệnh "npm run seed" trong backend.
 * Nạp toàn bộ dữ liệu mẫu vào cơ sở dữ liệu MongoDB thông qua module khoiTaoDuLieuMau.js.
 * @module utils/seedDb
 * @author Nguyễn Hoàng Hưng
 */

import { napDuLieuMau } from './khoiTaoDuLieuMau.js';

console.log('🚀 Bắt đầu thực thi Seed Database MongoDB cho Royal Bistro...');

napDuLieuMau()
  .then(() => {
    console.log('🎉 Hoàn tất thành công nạp dữ liệu mẫu vào MongoDB!');
    process.exit(0);
  })
  .catch((loi) => {
    console.error('❌ Thất bại khi nạp dữ liệu MongoDB:', loi);
    process.exit(1);
  });
