/**
 * @file server.js
 * @description Điểm khởi động chính (Main Entry Point) của máy chủ Back-End Quản Lý Nhà Hàng & Món Ăn (Royal Bistro).
 * Thiết lập các dịch vụ cốt lõi:
 * 1. Express RESTful API Server tiếp nhận các yêu cầu HTTP.
 * 2. Socket.io WebSocket Server phục vụ truyền thông thời gian thực giữa POS, Bếp KDS và Khách quét mã QR.
 * 3. Kết nối Cơ sở dữ liệu MongoDB qua Mongoose và tự động nạp dữ liệu mẫu ban đầu (Seeding).
 * 4. Tích hợp bộ lọc lỗi tập trung, Middleware ghi nhật ký request và bảo vệ CORS.
 * @module server
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Nhập cấu hình và tiện ích tiếng Việt
import { ketNoiCSDL } from './src/config/coSoDuLieu.js';
import { khoiTaoSocket } from './src/utils/truyenThongSocket.js';
import { napDuLieuMau } from './src/utils/khoiTaoDuLieuMau.js';
import dinhTuyenTongHop from './src/routes/dinhTuyenTongHop.js';
import { xuLyLoiToanCuc, xuLyKhongTimThay } from './src/middlewares/xuLyLoiHeThong.js';
import { ghiNhatKyYeuCau } from './src/middlewares/ghiNhatKyYeuCau.js';
import { ghiLog } from './src/utils/ghiNhatKyLog.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Cấu hình Socket.io Realtime toàn phần
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});
khoiTaoSocket(io);

// 2. Thiết lập Middlewares toàn cục & Bộ ghi nhật ký HTTP
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ghiNhatKyYeuCau);

// 3. Đăng ký Root API Router
app.use('/api', dinhTuyenTongHop);

// Tự động chuyển hướng từ trang chủ sang cổng thông tin API
app.get('/', (req, res) => {
  res.redirect('/api');
});

// 4. Middleware xử lý lỗi khi không tìm thấy Endpoint (404) & Lỗi hệ thống (500)
app.use(xuLyKhongTimThay);
app.use(xuLyLoiToanCuc);

const PORT = process.env.PORT || 5000;

// 5. Khởi động máy chủ HTTP & Kết nối Cơ sở dữ liệu MongoDB
server.listen(PORT, async () => {
  ghiLog.info('====================================================');
  ghiLog.success(`RESTful API Server đang chạy tại: http://localhost:${PORT}`);
  ghiLog.info(`📡 Máy chủ Socket.io Realtime đã sẵn sàng hoạt động!`);
  ghiLog.info('====================================================');
  try {
    await ketNoiCSDL();
    await napDuLieuMau();
  } catch (error) {
    ghiLog.error('❌ Lỗi khi khởi tạo Cơ sở dữ liệu MongoDB:', error.message);
  }
});
