import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket.io đã kết nối tới Backend:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.io đã ngắt kết nối');
      setConnected(false);
    });

    socketInstance.on('order:new', (order) => {
      setLatestNotification({
        type: 'new_order',
        title: `Đơn Món Mới - Bàn ${order.so_ban}`,
        message: `${order.ten_mon} (x${order.so_luong})`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    });

    socketInstance.on('order:status_updated', (order) => {
      setLatestNotification({
        type: 'status_update',
        title: `Cập nhật món - Bàn ${order.so_ban}`,
        message: `${order.ten_mon} -> ${order.trang_thai}`,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, latestNotification, clearNotification: () => setLatestNotification(null) }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
