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

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ThongBaoToastContext.jsx';
import { useAuth } from './NguoiDungContext.jsx';

const SocketRealtimeContext = createContext(null);

export function BoCungCapSocket({ children }) {
  const [socket, setSocket] = useState(null);
  const [daKetNoi, setDaKetNoi] = useState(false);
  const [thongBaoMoiNhat, setThongBaoMoiNhat] = useState(null);
  const toast = useToast();
  const { user } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Kiểm tra xem phiên hiện tại có phải là bên Phục vụ / Nhân viên nhà hàng hay không.
   * Khách hàng quét mã QR trên bàn hoặc tài khoản khách hàng tuyệt đối không nhận thông báo chuông của phục vụ.
   */
  const laBenPhucVu = () => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const laKhachQuetQR =
      urlParams.has('table') ||
      window.location.pathname.includes('/table') ||
      window.location.pathname.includes('/qr');
    if (laKhachQuetQR) return false;

    const currentUser = userRef.current;
    if (currentUser?.role === 'khach_hang') return false;

    const cacQuyenNhanVien = ['admin', 'nhan_vien', 'phuc_vu', 'thu_ngan', 'bep'];
    return Boolean(currentUser && cacQuyenNhanVien.includes(currentUser.role));
  };

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

    // 1. Lắng nghe khách gọi nhân viên phục vụ tận bàn (CHỈ hiển thị bên phục vụ/nhân viên)
    thucTheSocket.on('staff:called', (data) => {
      if (!laBenPhucVu()) {
        return;
      }

      const tieuDe = `🔔 BÀN ${data?.so_ban || '?'} GỌI PHỤC VỤ`;
      const noiDung = data?.message || `Bàn ${data?.so_ban || ''} (${data?.khu_vuc || 'Sảnh'}) đang bấm chuông gọi nhân viên phục vụ!`;
      
      setThongBaoMoiNhat({
        type: 'call_waiter',
        title: tieuDe,
        message: noiDung,
        time: data?.call_time || new Date().toLocaleTimeString('vi-VN')
      });

      // Hiển thị toast popup tự mất sau đúng 3s theo yêu cầu
      toast.goiPhucVu(noiDung, tieuDe, 3000);
    });

    // 2. Lắng nghe khách yêu cầu thanh toán (CHỈ hiển thị bên phục vụ / thu ngân)
    thucTheSocket.on('payment:requested', (data) => {
      if (!laBenPhucVu()) {
        return;
      }

      const kieuThanhToan = data?.phuong_thuc === 'chuyen_khoan' ? 'Chuyển khoản VietQR' : 'Tiền mặt';
      const tieuDe = `💳 BÀN ${data?.so_ban || '?'} YÊU CẦU THANH TOÁN`;
      const noiDung = data?.message || `Bàn ${data?.so_ban || ''} yêu cầu thanh toán bằng ${kieuThanhToan}!`;

      setThongBaoMoiNhat({
        type: 'payment',
        title: tieuDe,
        message: noiDung,
        time: data?.call_time || new Date().toLocaleTimeString('vi-VN')
      });

      toast.thanhToan(noiDung, tieuDe, 3000);
    });

    // 3. Lắng nghe sự kiện Đơn món mới (CHỈ hiển thị cho nhân viên Bếp / Phục vụ)
    thucTheSocket.on('order:new', (donMon) => {
      if (!laBenPhucVu()) {
        return;
      }

      const tieuDe = `🍽️ ĐƠN MỚI - BÀN ${donMon?.so_ban || '?'}`;
      const noiDung = `${donMon?.ten_mon || 'Món ăn'} (x${donMon?.so_luong || 1})`;

      setThongBaoMoiNhat({
        type: 'new_order',
        title: tieuDe,
        message: noiDung,
        time: new Date().toLocaleTimeString('vi-VN')
      });

      toast.thanhCong(noiDung, tieuDe, 3000);
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

      // Chỉ hiển thị toast chung cho bên phục vụ; khách hàng đã có cập nhật riêng ở trang KhachHangGoiMonQR
      if (laBenPhucVu()) {
        toast.thongTin(noiDung, tieuDe, 3000);
      }
    });

    // 5. Lắng nghe cập nhật bàn ăn: Đồng bộ trạng thái sơ đồ bàn, không phát thêm toast chuông để tránh trùng lặp
    thucTheSocket.on('table:updated', (_duLieuBan) => {
      // Không gọi toast.goiPhucVu ở đây vì 'staff:called' đã đảm nhiệm thông báo cho nhân viên phục vụ
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
