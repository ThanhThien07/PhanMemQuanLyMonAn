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
 * @author Nguyễn Hoàng Hưng
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
   * Xác định vai trò của người dùng hiện tại để gửi đúng thông báo tới đúng bộ phận:
   * - Khách gọi phục vụ (staff:called) -> Phục vụ / Nhân viên sảnh / Quản lý
   * - Khách yêu cầu thanh toán (payment:requested) -> Quầy Thu Ngân / Quản lý
   * - Đơn món mới (order:new) -> Bếp KDS / Đầu bếp / Quản lý
   * - Món nấu xong (order:status_updated = hoan_thanh) -> Phục vụ (để bưng ra bàn)
   */
  const layVaiTroHienTai = () => {
    if (typeof window === 'undefined') return 'khach_hang';
    const urlParams = new URLSearchParams(window.location.search);
    const laKhachQuetQR =
      urlParams.has('table') ||
      window.location.pathname.includes('/table') ||
      window.location.pathname.includes('/qr');
    if (laKhachQuetQR) return 'khach_hang';

    const currentUser = userRef.current;
    if (!currentUser) return 'khach_hang';
    return currentUser.role || currentUser.vai_tro || 'khach_hang';
  };

  const laPhucVu = () => {
    const role = layVaiTroHienTai();
    return role === 'phuc_vu' || role === 'nhan_vien' || role === 'admin';
  };

  const laThuNgan = () => {
    const role = layVaiTroHienTai();
    return role === 'thu_ngan' || role === 'admin';
  };

  const laBep = () => {
    const role = layVaiTroHienTai();
    return role === 'bep' || role === 'admin';
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

    // 1. Lắng nghe khách gọi nhân viên phục vụ tận bàn (CHỈ GỬI CHO BÊN PHỤC VỤ)
    thucTheSocket.on('staff:called', (data) => {
      if (!laPhucVu()) {
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

    // 2. Lắng nghe khách yêu cầu thanh toán (CHỈ GỬI CHO QUẦY THU NGÂN)
    thucTheSocket.on('payment:requested', (data) => {
      if (!laThuNgan()) {
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

    // 3. Lắng nghe sự kiện Đơn món mới (CHỈ GỬI CHO MÀN HÌNH BẾP KDS)
    thucTheSocket.on('order:new', (donMon) => {
      if (!laBep()) {
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

    // 4. Lắng nghe sự kiện Bếp hoàn tất món ăn (CHỈ GỬI CHO PHỤC VỤ ĐỂ MANG RA BÀN)
    thucTheSocket.on('order:status_updated', (donMon) => {
      if (donMon?.trang_thai === 'hoan_thanh' && laPhucVu()) {
        const tieuDe = `👨‍🍳 MÓN ĐÃ XONG - BÀN ${donMon?.so_ban || '?'}`;
        const noiDung = `Món "${donMon?.ten_mon}" đã nấu xong, sẵn sàng bưng phục vụ!`;

        setThongBaoMoiNhat({
          type: 'status_update',
          title: tieuDe,
          message: noiDung,
          time: new Date().toLocaleTimeString('vi-VN')
        });

        toast.thongTin(noiDung, tieuDe, 3000);
      }
    });

    // 5. Lắng nghe cập nhật bàn ăn: Đồng bộ trạng thái sơ đồ bàn, không phát thêm toast chuông để tránh trùng lặp
    thucTheSocket.on('table:updated', (_duLieuBan) => {
      // Không gọi toast ở đây
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
