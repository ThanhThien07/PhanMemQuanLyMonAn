/**
 * @file server.js
 * @description Điểm khởi động chính (Main Entry Point) của máy chủ Back-End Quản Lý Nhà Hàng & Món Ăn (Royal Bistro).
 * Thiết lập các dịch vụ cốt lõi:
 * 1. Express RESTful API Server tiếp nhận các yêu cầu HTTP.
 * 2. Socket.io WebSocket Server phục vụ truyền thông thời gian thực giữa POS, Bếp KDS và Khách quét mã QR.
 * 3. Kết nối Cơ sở dữ liệu MongoDB qua Mongoose và tự động nạp dữ liệu mẫu ban đầu (Seeding).
 * 4. Tích hợp bộ lọc lỗi tập trung, Middleware ghi nhật ký request và bảo vệ CORS.
 * @module server
 * @author Nguyễn Hoàng Hưng
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Nhập cấu hình và tiện ích tiếng Việt
import { ketNoiCSDL } from './src/config/coSoDuLieu.js';
import { khoiTaoSocket } from './src/utils/truyenThongSocket.js';
import { napDuLieuMau } from './src/utils/khoiTaoDuLieuMau.js';
import dinhTuyenTongHop from './src/routes/dinhTuyenTongHop.js';
import { xuLyLoiToanCuc, xuLyKhongTimThay } from './src/middlewares/xuLyLoiHeThong.js';
import { ghiNhatKyYeuCau } from './src/middlewares/ghiNhatKyYeuCau.js';
import { ghiLog } from './src/utils/ghiNhatKyLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const thuMucFrontendDist = path.resolve(__dirname, '../FE/dist');

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

// 2. Thiết lập Middlewares tối ưu hóa tốc độ & an ninh mạng (Slide 14 & Slide 15)
// Tối ưu Nén dữ liệu Gzip / Brotli cho toàn bộ response JSON, HTML, CSS, JS (Slide 15)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // Chỉ nén với payload > 1KB
  level: 6
}));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bảo mật tiêu đề phản hồi & hỗ trợ ETag
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(ghiNhatKyYeuCau);

// 3. Đăng ký Root API Router
app.use('/api', dinhTuyenTongHop);

// Phục vụ giao diện Frontend (React SPA) từ thư mục FE/dist nếu đã build kèm chiến lược Caching (Slide 14 & Slide 26)
if (fs.existsSync(thuMucFrontendDist)) {
  // Tuyến đường robots.txt và sitemap.xml phục vụ Bot tìm kiếm (Slide 26)
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(thuMucFrontendDist, 'robots.txt'));
  });

  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(thuMucFrontendDist, 'sitemap.xml'));
  });

  // Cấu hình Cache-Control theo quy tắc Google (Slide 14):
  // HTML: no-cache; Tệp tĩnh có hash (/assets/*): public, max-age=31536000, immutable
  app.use(express.static(thuMucFrontendDist, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.includes('assets')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  app.get('*', (req, res, next) => {
    // Không can thiệp nếu là request API hoặc Socket
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(thuMucFrontendDist, 'index.html'));
  });
} else {
  // Dự phòng nếu chưa build Frontend: chuyển hướng sang cổng thông tin API
  app.get('/', (req, res) => {
    res.redirect('/api');
  });
}

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
