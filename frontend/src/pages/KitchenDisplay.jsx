import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { 
  ChefHat, 
  Flame, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function KitchenDisplay() {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/kitchen');
      if (res.success) {
        setKitchenOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      const handleNewOrder = (order) => {
        setKitchenOrders((prev) => [order, ...prev]);
        playNotificationSound();
      };

      const handleStatusUpdate = (updatedOrder) => {
        setKitchenOrders((prev) => {
          if (updatedOrder.trang_thai === 'da_phuc_vu' || updatedOrder.trang_thai === 'hoan_thanh' || updatedOrder.trang_thai === 'da_huy') {
            return prev.filter((o) => o.id !== updatedOrder.id);
          }
          return prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
        });
      };

      socket.on('order:new', handleNewOrder);
      socket.on('order:status_updated', handleStatusUpdate);

      return () => {
        socket.off('order:new', handleNewOrder);
        socket.off('order:status_updated', handleStatusUpdate);
      };
    }
  }, [socket]);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        trang_thai: newStatus
      });
      if (res.success) {
        if (newStatus === 'da_phuc_vu') {
          setKitchenOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
          setKitchenOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, trang_thai: newStatus } : o))
          );
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Màn Hình Bếp Trưởng (Kitchen Display System)
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Tự động nhận order realtime qua Socket.io & Tự động trừ kho theo định lượng (BOM)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm Mới
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs">
            Đang Chờ: {kitchenOrders.length} món
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Tất Cả Món Đã Được Phục Vụ!</h3>
          <p className="text-sm text-slate-500 font-medium">
            Hiện tại không có đơn món nào đang chờ chế biến. Bếp có thể nghỉ ngơi hoặc chuẩn bị nguyên liệu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map((item) => {
            const isCooking = item.trang_thai === 'dang_che_bien';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isCooking
                    ? 'bg-sky-50/70 border-sky-300 shadow-lg shadow-sky-500/10'
                    : 'bg-white border-amber-300 shadow-lg shadow-amber-500/10'
                }`}
              >
                <div>
                  {/* Top Bar: Table Number & Time */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
                        B{item.so_ban}
                      </span>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">Bàn {item.so_ban}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{item.khu_vuc}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                        isCooking
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      }`}
                    >
                      {isCooking ? '🔥 Đang Nấu' : '⏳ Chờ Bếp Nhận'}
                    </span>
                  </div>

                  {/* Dish Main Content */}
                  <div className="py-4 flex gap-4">
                    <img
                      src={item.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160'}
                      alt={item.ten_mon}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="flex-1">
                      <h4 className="text-base font-black text-slate-900 leading-tight">
                        {item.ten_mon}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-black text-amber-700 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                          Số lượng: x{item.so_luong}
                        </span>
                      </div>
                      {item.ghi_chu && (
                        <div className="mt-2 text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                          ⚠️ Ghi chú: {item.ghi_chu}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-200/80">
                  {isCooking ? (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'da_phuc_vu')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Nấu Xong & Báo Phục Vụ
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'dang_che_bien')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Flame className="w-4 h-4" />
                      Bắt Đầu Chế Biến (Trừ Kho BOM)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
