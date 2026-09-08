import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  Utensils, 
  Users 
} from 'lucide-react';
import BillModal from '../components/BillModal';
import { formatCurrency } from '../utils/format';

export default function POSOrder() {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, dishRes, tableRes] = await Promise.all([
        api.get('/dishes/categories'),
        api.get('/dishes'),
        api.get('/tables')
      ]);

      if (catRes.success) setCategories(catRes.categories);
      if (dishRes.success) setDishes(dishRes.dishes);
      if (tableRes.success) {
        setTables(tableRes.tables);
        if (!selectedTable && tableRes.tables.length > 0) {
          setSelectedTable(tableRes.tables[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableOrders = async (tableId) => {
    if (!tableId) return;
    try {
      const res = await api.get(`/orders?ban_id=${tableId}&unpaid_only=true`);
      if (res.success) {
        setTableOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableOrders(selectedTable.id);
    }
  }, [selectedTable]);

  const addToCart = (dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.mon_an_id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.mon_an_id === dish.id
            ? { ...item, so_luong: item.so_luong + 1 }
            : item
        );
      }
      return [...prev, { mon_an_id: dish.id, dish, so_luong: 1, ghi_chu: '', options: {} }];
    });
  };

  const updateQuantity = (dishId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.mon_an_id === dishId) {
            const newQty = item.so_luong + delta;
            return newQty > 0 ? { ...item, so_luong: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateNote = (dishId, note) => {
    setCart((prev) =>
      prev.map((item) => (item.mon_an_id === dishId ? { ...item, ghi_chu: note } : item))
    );
  };

  const handleSendOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    try {
      setLoading(true);
      const res = await api.post('/orders', {
        ban_id: selectedTable.id,
        items: cart.map((c) => ({
          mon_an_id: c.mon_an_id,
          so_luong: c.so_luong,
          ghi_chu: c.ghi_chu,
          options: c.options
        }))
      });

      if (res.success) {
        setCart([]);
        setOrderSuccess(true);
        fetchTableOrders(selectedTable.id);
        fetchData();
        setTimeout(() => setOrderSuccess(false), 2500);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchCat = selectedCategory === 'all' || dish.loai_mon_id === Number(selectedCategory);
    const matchSearch =
      dish.ten_mon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.mo_ta && dish.mo_ta.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.dish.gia * item.so_luong, 0);
  const activeOrdersTotal = tableOrders.reduce((sum, item) => sum + (item.tong_tien || 0), 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      {/* LEFT & CENTER: MENU SELECTION */}
      <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-100/50 p-5 overflow-hidden">
        {/* Top Controls: Search & Category Filter */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm món theo tên, nguyên liệu, hương vị..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Quick Table Switcher */}
            <select
              value={selectedTable?.id || ''}
              onChange={(e) => {
                const found = tables.find((t) => t.id === Number(e.target.value));
                setSelectedTable(found || null);
              }}
              className="bg-white border border-amber-300 text-amber-900 font-extrabold text-sm px-4 py-2.5 rounded-xl focus:outline-none shadow-2xs cursor-pointer"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Bàn {t.so_ban} ({t.khu_vuc}) - {t.trang_thai === 'co_khach' ? '🟢 Đang dùng' : '⚪ Trống'}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
              }`}
            >
              Tất Cả Món ({dishes.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
                }`}
              >
                {cat.ten_loai}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => addToCart(dish)}
                className="group relative bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative h-32 overflow-hidden bg-slate-100">
                  <img
                    src={dish.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                    alt={dish.ten_mon}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-amber-700 border border-amber-200 shadow-2xs">
                    {dish.ten_loai}
                  </span>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {dish.ten_mon}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {dish.mo_ta || 'Món ăn đặc sản tươi ngon chuẩn vị nhà hàng'}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-black text-amber-600">
                      {formatCurrency(dish.gia)}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-500 text-amber-700 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CART & CURRENT TABLE ORDERS */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-lg">
        {/* Table Header Info */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              {selectedTable?.so_ban || '?'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Bàn {selectedTable?.so_ban} • {selectedTable?.khu_vuc}
              </div>
              <div className="text-xs text-slate-500">
                Sức chứa: {selectedTable?.suc_chua} người
              </div>
            </div>
          </div>

          {tableOrders.length > 0 && (
            <button
              onClick={() => setShowBillModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Thanh Toán
            </button>
          )}
        </div>

        {/* Success Alert */}
        {orderSuccess && (
          <div className="m-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã gửi món vào Bếp thành công!</span>
          </div>
        )}

        {/* Scrollable Order & Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Section 1: Đang chọn (Giỏ hàng mới) */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-2 flex items-center justify-between">
              <span>🛒 Món Mới Chuẩn Bị Gửi ({cart.length})</span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                Chạm vào món ăn ở bên trái để thêm vào bàn
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.mon_an_id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.dish.ten_mon}</span>
                      <span className="font-black text-amber-600">
                        {formatCurrency(item.dish.gia * item.so_luong)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.mon_an_id, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-slate-900">
                          {item.so_luong}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.mon_an_id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Note Input */}
                      <input
                        type="text"
                        value={item.ghi_chu}
                        onChange={(e) => updateNote(item.mon_an_id, e.target.value)}
                        placeholder="Ghi chú (ít cay, không hành...)"
                        className="flex-1 bg-white border border-slate-200 text-[11px] rounded-lg px-2 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Món đã gọi trước đó của bàn (Đang phục vụ) */}
          {tableOrders.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>📋 Món Đang Phục Vụ ({tableOrders.length})</span>
                <span className="text-emerald-700 font-black">
                  {formatCurrency(activeOrdersTotal)}
                </span>
              </div>

              <div className="space-y-1.5">
                {tableOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-slate-900 font-bold">{ord.ten_mon}</span>
                      <span className="text-slate-500 ml-1.5 font-semibold">x{ord.so_luong}</span>
                      {ord.ghi_chu && <div className="text-[10px] text-amber-700 font-semibold">*{ord.ghi_chu}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-slate-800 font-extrabold">
                        {formatCurrency(ord.tong_tien)}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        ord.trang_thai === 'cho_xac_nhan' ? 'bg-amber-100 text-amber-800' :
                        ord.trang_thai === 'dang_che_bien' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ord.trang_thai === 'cho_xac_nhan' ? 'Chờ bếp' :
                         ord.trang_thai === 'dang_che_bien' ? 'Đang nấu' : 'Đã phục vụ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Checkout Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-slate-500">Tổng Món Mới:</span>
            <span className="text-lg font-black text-amber-600">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          <button
            disabled={cart.length === 0 || loading}
            onClick={handleSendOrder}
            className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cart.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Gửi Vào Bếp (Realtime KDS)</span>
          </button>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showBillModal && selectedTable && (
        <BillModal
          table={selectedTable}
          orders={tableOrders}
          onClose={() => setShowBillModal(false)}
          onSuccess={() => {
            fetchTableOrders(selectedTable.id);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
