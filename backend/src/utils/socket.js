let io = null;

export function initSocket(socketIoInstance) {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`🔌 Client kết nối Socket.io: ${socket.id}`);

    // Tham gia phòng bếp hoặc phòng bàn ăn
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`📡 Socket ${socket.id} đã vào phòng: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client ngắt kết nối Socket.io: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Phát sự kiện đơn hàng mới tới màn hình Bếp và Thu Ngân
 */
export function emitNewOrder(orderData) {
  if (io) {
    io.emit('order:new', orderData);
    console.log('📢 Đã phát sự kiện order:new:', orderData);
  }
}

/**
 * Phát sự kiện cập nhật trạng thái món ăn (Đang nấu, Đã xong...)
 */
export function emitOrderStatusUpdate(updateData) {
  if (io) {
    io.emit('order:status_updated', updateData);
    console.log('📢 Đã phát sự kiện order:status_updated:', updateData);
  }
}

/**
 * Phát sự kiện cập nhật trạng thái bàn (Có khách, Trống, Đã thanh toán...)
 */
export function emitTableUpdate(tableData) {
  if (io) {
    io.emit('table:updated', tableData);
    console.log('📢 Đã phát sự kiện table:updated:', tableData);
  }
}

export default {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitTableUpdate
};
