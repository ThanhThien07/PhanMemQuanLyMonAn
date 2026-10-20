/**
 * @file truyenThongSocket.js
 * @description Quản lý kết nối truyền thông hai chiều thời gian thực (Full-Duplex Real-time) bằng Socket.io.
 * Cung cấp các hàm phát sóng (Broadcast Events) tới các client (màn hình Bếp KDS, sảnh Thu Ngân POS, khách quét mã QR tại bàn):
 * - order:new (Khi có khách hoặc nhân viên gửi đơn món mới)
 * - order:status_updated (Khi bếp chuyển trạng thái món: Chờ -> Đang nấu -> Hoàn thành)
 * - table:updated (Khi mở bàn, có khách vào, hoặc thanh toán giải phóng bàn)
 * - staff:called (Khi khách tại bàn bấm chuông gọi nhân viên phục vụ)
 * @module utils/truyenThongSocket
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

// Thực thể máy chủ Socket.io toàn cục
let thucTheSocketIO = null;

/**
 * Khởi tạo lắng nghe kết nối Socket.io
 * @function khoiTaoSocket
 * @param {Object} socketIoInstance - Thể hiện Socket.io Server được tạo từ HTTP Server
 * @returns {Object}
 */
export function khoiTaoSocket(socketIoInstance) {
  thucTheSocketIO = socketIoInstance;

  thucTheSocketIO.on('connection', (socket) => {
    console.log(`🔌 Thiết bị kết nối Socket.io: ${socket.id}`);

    // Cho phép máy trạm tham gia vào các phòng riêng (room): 'bep', 'thu_ngan', 'ban_1'...
    socket.on('join_room', (tenPhong) => {
      socket.join(tenPhong);
      console.log(`📡 Socket [${socket.id}] đã tham gia phòng: ${tenPhong}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Thiết bị đã ngắt kết nối Socket.io: ${socket.id}`);
    });
  });

  return thucTheSocketIO;
}

/**
 * Lấy thể hiện Socket.io hiện tại
 * @function layThucTheSocket
 * @returns {Object}
 */
export function layThucTheSocket() {
  return thucTheSocketIO;
}

/**
 * Phát sự kiện đơn gọi món mới tới toàn bộ máy trạm Bếp KDS và Thu Ngân POS
 * @function phatSuKienDonMonMoi
 * @param {Object} duLieuDonMon - Chi tiết đơn gọi món vừa tạo
 */
export function phatSuKienDonMonMoi(duLieuDonMon) {
  if (thucTheSocketIO) {
    thucTheSocketIO.emit('order:new', duLieuDonMon);
    console.log('📢 [SOCKET] Phát sự kiện đơn mới (order:new):', duLieuDonMon?.id || duLieuDonMon);
  }
}

/**
 * Phát sự kiện cập nhật trạng thái chế biến món ăn (Đang nấu, hoàn thành...)
 * @function phatSuKienTrangThaiMon
 * @param {Object} duLieuCapNhat - Trạng thái mới của món ăn
 */
export function phatSuKienTrangThaiMon(duLieuCapNhat) {
  if (thucTheSocketIO) {
    thucTheSocketIO.emit('order:status_updated', duLieuCapNhat);
    console.log('📢 [SOCKET] Phát sự kiện cập nhật món (order:status_updated):', duLieuCapNhat?.id || duLieuCapNhat);
  }
}

/**
 * Phát sự kiện cập nhật trạng thái bàn ăn (Trống, Có khách, Yêu cầu thanh toán...)
 * @function phatSuKienTrangThaiBan
 * @param {Object} duLieuBan - Thông tin cập nhật của bàn ăn
 */
export function phatSuKienTrangThaiBan(duLieuBan) {
  if (thucTheSocketIO) {
    thucTheSocketIO.emit('table:updated', duLieuBan);
    console.log('📢 [SOCKET] Phát sự kiện cập nhật bàn (table:updated):', duLieuBan?.so_ban || duLieuBan);
  }
}

/**
 * Phát sự kiện khách tại bàn gọi nhân viên phục vụ
 * @function phatSuKienGoiNhanVien
 * @param {Object} duLieuGoi - Thông tin bàn gọi phục vụ
 */
export function phatSuKienGoiNhanVien(duLieuGoi) {
  if (thucTheSocketIO) {
    thucTheSocketIO.emit('staff:called', duLieuGoi);
    console.log('📢 [SOCKET] Phát sự kiện gọi nhân viên (staff:called):', duLieuGoi?.so_ban || duLieuGoi);
  }
}

/**
 * Phát sự kiện khách tại bàn yêu cầu thanh toán hóa đơn
 * @function phatSuKienYeuCauThanhToan
 * @param {Object} duLieuTT - Thông tin bàn và phương thức thanh toán
 */
export function phatSuKienYeuCauThanhToan(duLieuTT) {
  if (thucTheSocketIO) {
    thucTheSocketIO.emit('payment:requested', duLieuTT);
    console.log('📢 [SOCKET] Phát sự kiện yêu cầu thanh toán (payment:requested):', duLieuTT?.so_ban || duLieuTT);
  }
}

// Giữ các bí danh tiếng Anh để duy trì tính tương thích ngược
export const initSocket = khoiTaoSocket;
export const getIO = layThucTheSocket;
export const emitNewOrder = phatSuKienDonMonMoi;
export const emitOrderStatusUpdate = phatSuKienTrangThaiMon;
export const emitTableUpdate = phatSuKienTrangThaiBan;
export const emitStaffCall = phatSuKienGoiNhanVien;
export const emitPaymentRequest = phatSuKienYeuCauThanhToan;

export default {
  khoiTaoSocket,
  layThucTheSocket,
  phatSuKienDonMonMoi,
  phatSuKienTrangThaiMon,
  phatSuKienTrangThaiBan,
  phatSuKienGoiNhanVien,
  phatSuKienYeuCauThanhToan,
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitTableUpdate,
  emitStaffCall,
  emitPaymentRequest
};
