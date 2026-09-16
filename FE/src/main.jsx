/**
 * @file main.jsx
 * @description Điểm khởi động ứng dụng React Frontend (Royal Bistro).
 * Thiết lập các Context Provider: Bắt lỗi giao diện (BatLoiGiaoDien), Xác thực người dùng (NguoiDungContext),
 * Kết nối Realtime Socket.io (SocketRealtimeContext), và Thông báo hệ thống Toast (ThongBaoToastContext).
 * @module main
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { NguoiDungProvider } from './context/NguoiDungContext.jsx';
import { SocketRealtimeProvider } from './context/SocketRealtimeContext.jsx';
import { ThongBaoToastProvider } from './context/ThongBaoToastContext.jsx';
import BatLoiGiaoDien from './components/common/BatLoiGiaoDien.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BatLoiGiaoDien>
      <NguoiDungProvider>
        <SocketRealtimeProvider>
          <ThongBaoToastProvider>
            <App />
          </ThongBaoToastProvider>
        </SocketRealtimeProvider>
      </NguoiDungProvider>
    </BatLoiGiaoDien>
  </React.StrictMode>
);
