/**
 * @file SocketRealtimeContext.jsx
 * @description React Context quản lý kết nối truyền thông thời gian thực Socket.io Client.
 * Lắng nghe các sự kiện phát sóng từ máy chủ:
 * - 'order:new': Nhận thông báo khi có đơn món mới
 * - 'order:status_updated': Cập nhật trạng thái món (đang nấu, đã xong)
 * - 'table:updated': Đồng bộ sơ đồ bàn khi có khách hoặc thanh toán
 * @module context/SocketRealtimeContext
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketRealtimeContext = createContext(null);

export function BoCungCapSocket({ children }) {
  const [socket, setSocket] = useState(null);
  const [daKetNoi, setDaKetNoi] = useState(false);
  const [thongBaoMoiNhat, setThongBaoMoiNhat] = useState(null);

  useEffect(() => {
    const thucTheSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    thucTheSocket.on('connect', () => {
      console.log('🔌 Socket.io đã kết nối tới Backend:', thucTheSocket.id);
      setDaKetNoi(true);
    });

    thucTheSocket.on('disconnect', () => {
      console.log('❌ Socket.io đã ngắt kết nối khỏi Backend');
      setDaKetNoi(false);
    });

    // Lắng nghe sự kiện Đơn món mới
    thucTheSocket.on('order:new', (donMon) => {
      setThongBaoMoiNhat({
        type: 'new_order',
        title: `Đơn Món Mới - Bàn ${donMon.so_ban}`,
        message: `${donMon.ten_mon} (x${donMon.so_luong})`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    });

    // Lắng nghe sự kiện Cập nhật trạng thái món ăn
    thucTheSocket.on('order:status_updated', (donMon) => {
      setThongBaoMoiNhat({
        type: 'status_update',
        title: `Cập nhật món - Bàn ${donMon.so_ban}`,
        message: `${donMon.ten_mon} -> ${donMon.trang_thai}`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    });

    setSocket(thucTheSocket);

    return () => {
      thucTheSocket.disconnect();
    };
  }, []);

  return (
    <SocketRealtimeContext.Provider
      value={{
        socket,
        daKetNoi,
        thongBaoMoiNhat,
        xoaThongBao: () => setThongBaoMoiNhat(null),
        // Bí danh tương thích
        connected: daKetNoi,
        latestNotification: thongBaoMoiNhat,
        clearNotification: () => setThongBaoMoiNhat(null)
      }}
    >
      {children}
    </SocketRealtimeContext.Provider>
  );
}

/**
 * Hook truy cập Socket Realtime Context
 */
export function suDungSocket() {
  return useContext(SocketRealtimeContext);
}

// Bí danh tương thích
export const SocketProvider = BoCungCapSocket;
export const SocketRealtimeProvider = BoCungCapSocket;
export const useSocket = suDungSocket;
export const useSocketRealtime = suDungSocket;

export default SocketRealtimeContext;
