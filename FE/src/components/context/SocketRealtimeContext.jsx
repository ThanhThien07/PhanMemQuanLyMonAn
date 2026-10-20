/**
 * @file SocketRealtimeContext.jsx
 * @description React Context quản lý kết nối truyền thông thời gian thực Socket.io Client.
 * Lắng nghe các sự kiện phát sóng từ máy chủ và đồng bộ trực tiếp vào hệ thống Toast 5s / Max 5:
 * - 'staff:called': Khách bấm chuông gọi nhân viên phục vụ tận bàn
 * - 'payment:requested': Khách bấm yêu cầu thanh toán (VietQR hoặc tiền mặt)
 * - 'order:new': Nhận thông báo khi có đơn món mới
 * - 'order:status_updated': Cập nhật trạng thái món (đang nấu, đã xong)
 * - 'table:updated': Đồng bộ sơ đồ bàn khi có khách, mở bàn hoặc thanh toán
 * @module context/SocketRealtimeContext
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ThongBaoToastContext.jsx';

const SocketRealtimeContext = createContext(null);

export function BoCungCapSocket({ children }) {
  const [socket, setSocket] = useState(null);
  const [daKetNoi, setDaKetNoi] = useState(false);
  const [thongBaoMoiNhat, setThongBaoMoiNhat] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const socketHost = typeof window !== 'undefined' && window.location.port === '3000'
      ? window.location.origin
      : `http://${(typeof window !== 'undefined' && window.location.hostname) || 'localhost'}:5000`;

    const thucTheSocket = io(socketHost, {
      path: '/socket.io',
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

    // 1. Lắng nghe khách gọi nhân viên phục vụ tận bàn
    thucTheSocket.on('staff:called', (data) => {
      const tieuDe = `🔔 BÀN ${data?.so_ban || '?'} GỌI PHỤC VỤ`;
      const noiDung = data?.message || `Bàn ${data?.so_ban || ''} (${data?.khu_vuc || 'Sảnh'}) đang bấm chuông gọi nhân viên phục vụ!`;
      
      setThongBaoMoiNhat({
        type: 'call_waiter',
        title: tieuDe,
        message: noiDung,
        time: data?.call_time || new Date().toLocaleTimeString('vi-VN')
      });

      // Hiển thị toast popup tự mất sau 5s, tối đa 5 thông báo, đẩy thông báo cũ nhất đi
      toast.goiPhucVu(noiDung, tieuDe, 5000);
    });

    // 2. Lắng nghe khách yêu cầu thanh toán
    thucTheSocket.on('payment:requested', (data) => {
      const kieuThanhToan = data?.phuong_thuc === 'chuyen_khoan' ? 'Chuyển khoản VietQR' : 'Tiền mặt';
      const tieuDe = `💳 BÀN ${data?.so_ban || '?'} YÊU CẦU THANH TOÁN`;
      const noiDung = data?.message || `Bàn ${data?.so_ban || ''} yêu cầu thanh toán bằng ${kieuThanhToan}!`;

      setThongBaoMoiNhat({
        type: 'payment',
        title: tieuDe,
        message: noiDung,
        time: data?.call_time || new Date().toLocaleTimeString('vi-VN')
      });

      toast.thanhToan(noiDung, tieuDe, 5000);
    });

    // 3. Lắng nghe sự kiện Đơn món mới
    thucTheSocket.on('order:new', (donMon) => {
      const tieuDe = `🍽️ ĐƠN MỚI - BÀN ${donMon?.so_ban || '?'}`;
      const noiDung = `${donMon?.ten_mon || 'Món ăn'} (x${donMon?.so_luong || 1})`;

      setThongBaoMoiNhat({
        type: 'new_order',
        title: tieuDe,
        message: noiDung,
        time: new Date().toLocaleTimeString('vi-VN')
      });

      toast.thanhCong(noiDung, tieuDe, 5000);
    });

    // 4. Lắng nghe sự kiện Cập nhật trạng thái món ăn
    thucTheSocket.on('order:status_updated', (donMon) => {
      const trangThaiViet = donMon?.trang_thai === 'dang_che_bien' 
        ? 'Đang chế biến 👨‍🍳' 
        : donMon?.trang_thai === 'hoan_thanh' 
          ? 'Nấu xong & Sẵn sàng phục vụ ✅' 
          : donMon?.trang_thai || '';

      const tieuDe = `👨‍🍳 BẾP - BÀN ${donMon?.so_ban || '?'}`;
      const noiDung = `Món "${donMon?.ten_mon}" -> ${trangThaiViet}`;

      setThongBaoMoiNhat({
        type: 'status_update',
        title: tieuDe,
        message: noiDung,
        time: new Date().toLocaleTimeString('vi-VN')
      });

      toast.thongTin(noiDung, tieuDe, 5000);
    });

    // 5. Lắng nghe cập nhật bàn ăn
    thucTheSocket.on('table:updated', (duLieuBan) => {
      if (duLieuBan?.goi_phuc_vu) {
        const tieuDe = `🔔 BÀN ${duLieuBan.so_ban} CẦN HỖ TRỢ`;
        const noiDung = `Bàn ${duLieuBan.so_ban} (${duLieuBan.khu_vuc || 'Sảnh'}) đang yêu cầu hỗ trợ!`;
        toast.goiPhucVu(noiDung, tieuDe, 5000);
      }
    });

    setSocket(thucTheSocket);

    return () => {
      thucTheSocket.disconnect();
    };
  }, [toast]);

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
