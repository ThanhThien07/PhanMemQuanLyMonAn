import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './src/utils/socket.js';
import { seedDatabase } from './src/utils/seedDb.js';
import apiRouter from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import requestLogger from './src/middlewares/requestLogger.js';
import logger from './src/utils/logger.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Cấu hình Socket.io Realtime
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});
initSocket(io);

// 2. Middlewares toàn cục & Request Logging để dễ debug
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 3. Đăng ký Root API Router
app.use('/api', apiRouter);

// Root Index Redirect
app.get('/', (req, res) => {
  res.redirect('/api');
});

// 4. Middleware xử lý 404 & Lỗi hệ thống
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Khởi động server và khởi tạo CSDL
server.listen(PORT, async () => {
  logger.info(`====================================================`);
  logger.success(`REST API Server đang chạy tại: http://localhost:${PORT}`);
  logger.info(`📡 Socket.io Realtime Server sẵn sàng!`);
  logger.info(`====================================================`);
  try {
    await seedDatabase();
  } catch (error) {
    logger.error('❌ Lỗi khi khởi tạo CSDL:', error.message);
  }
});
