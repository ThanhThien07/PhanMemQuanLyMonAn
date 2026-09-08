import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Grid3X3, 
  Users, 
  CreditCard, 
  Utensils, 
  CheckCircle 
} from 'lucide-react';
import BillModal from '../components/BillModal';
import { formatCurrency } from '../utils/format';

export default function TableManagement({ setActiveTab }) {
  const [tables, setTables] = useState([]);
  const [activeArea, setActiveArea] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTableForBill, setSelectedTableForBill] = useState(null);
  const [billOrders, setBillOrders] = useState([]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tables');
      if (res.success) {
        setTables(res.tables);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenBill = async (table) => {
    try {
      const res = await api.get(`/orders?ban_id=${table.id}&unpaid_only=true`);
      if (res.success) {
        setBillOrders(res.orders);
        setSelectedTableForBill(table);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (table, newStatus) => {
    try {
      await api.patch(`/tables/${table.id}/status`, {
        trang_thai: newStatus,
        so_luong_khach: newStatus === 'co_khach' ? 2 : 0
      });
      fetchTables();
    } catch (err) {
      alert(err.message);
    }
  };

  const areas = ['all', 'Tầng 1 - Sảnh Chính', 'Tầng 2 - Ban Công', 'Phòng VIP 1 (Hoàng Gia)', 'Phòng VIP 2 (Kim Cương)'];
  const filteredTables = tables.filter((t) =>
    activeArea === 'all' ? true : t.khu_vuc.includes(activeArea) || t.khu_vuc === activeArea
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Area Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Sơ Đồ Bàn Ăn & Phòng Tiệc</h2>
          <p className="text-slate-500 text-sm font-medium">Theo dõi trực quan tình trạng bàn, khách đang dùng và hóa đơn</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Trống (Sẵn sàng)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-slate-600">Có khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            <span className="text-slate-600">Đã đặt trước</span>
          </div>
        </div>
      </div>

      {/* Area Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeArea === area
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
            }`}
          >
            {area === 'all' ? 'Tất Cả Khu Vực' : area}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTables.map((table) => {
          const isBusy = table.trang_thai === 'co_khach';
          const isReserved = table.trang_thai === 'da_dat';
          const isAvailable = table.trang_thai === 'trong';

          return (
            <div
              key={table.id}
              className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isBusy
                  ? 'bg-amber-50/70 border-amber-300 shadow-md shadow-amber-500/10'
                  : isReserved
                  ? 'bg-sky-50/70 border-sky-300 shadow-md shadow-sky-500/10'
                  : 'bg-white border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {/* Top Row: Number & Status Badge */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${
                        isBusy
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : isReserved
                          ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      B{table.so_ban}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Bàn {table.so_ban}</h4>
                      <p className="text-xs text-slate-500 font-medium">{table.khu_vuc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                      isBusy
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : isReserved
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {isBusy ? '🟢 Có khách' : isReserved ? '🔵 Đã đặt' : '⚪ Trống'}
                  </span>
                </div>

                {/* Capacity & Orders Info */}
                <div className="space-y-1.5 text-xs text-slate-600 mt-4 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span>Sức chứa:</span>
                    <span className="text-slate-900 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {table.suc_chua} chỗ
                    </span>
                  </div>
                  {isBusy && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Số món đang gọi:</span>
                        <span className="text-amber-700 font-extrabold">{table.so_mon || 0} món</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span>Tạm tính:</span>
                        <span className="text-emerald-700 font-black text-sm">
                          {formatCurrency(table.tam_tinh || 0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                {isBusy ? (
                  <>
                    <button
                      onClick={() => setActiveTab('pos')}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Thêm Món
                    </button>
                    <button
                      onClick={() => handleOpenBill(table)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Tính Tiền
                    </button>
                  </>
                ) : isReserved ? (
                  <button
                    onClick={() => handleToggleStatus(table, 'co_khach')}
                    className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-sky-500/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Khách Đến (Nhận Bàn)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleToggleStatus(table, 'co_khach');
                      setActiveTab('pos');
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    Mở Bàn & Gọi Món
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Modal */}
      {selectedTableForBill && (
        <BillModal
          table={selectedTableForBill}
          orders={billOrders}
          onClose={() => setSelectedTableForBill(null)}
          onSuccess={() => {
            fetchTables();
          }}
        />
      )}
    </div>
  );
}
