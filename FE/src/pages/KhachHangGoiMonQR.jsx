/**
 * @file KhachHangGoiMonQR.jsx
 * @description Giao diện Khách hàng Quét mã QR tại Bàn (Customer QR Ordering & Self-Service Experience).
 * Dành cho thực khách trực tiếp sử dụng điện thoại thông minh quét mã QR dán trên bàn ăn:
 * 1. Tự động nhận diện số bàn qua tham số URL (?table=1, ?table=2...).
 * 2. Khám phá toàn bộ thực đơn theo từng nhóm danh mục (Khai vị, Món chính, Hải sản, Đồ uống...).
 * 3. Tìm kiếm món ăn thông minh theo tên và mô tả.
 * 4. Tùy biến khẩu vị (Độ chín Steak, Sốt bơ tỏi / sốt tiêu, Lượng đá, Lượng đường) và thêm ghi chú cho Bếp.
 * 5. Giỏ hàng động với hiệu ứng micro-animations mượt mà, gửi order trực tiếp xuống màn hình Bếp KDS.
 * 6. Bảng theo dõi trạng thái món ăn thời gian thực (Live Order Tracking): Chờ xác nhận -> Đang nấu -> Đã phục vụ.
 * 7. Bấm chuông gọi nhân viên phục vụ tận bàn (Call Waiter) & Yêu cầu thanh toán (Request Payment).
 * 8. Xem hóa đơn tạm tính và thanh toán chuyển khoản VietQR tự động qua ảnh mã QR chuẩn nhà hàng (/ma_qr.jpg).
 * 9. Gửi nhận xét và chấm sao đánh giá chất lượng dịch vụ (1 - 5 sao).
 * @module pages/KhachHangGoiMonQR
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, Clock, Bell, Receipt, CheckCircle, ChevronRight, 
  ShoppingBag, Plus, Minus, X, Star, AlertTriangle, QrCode, Sparkles, Flame, User, Search
} from 'lucide-react';
import clientAxios from '../services/cauHinhAxiosApi.js';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu.js';
import { useSocket } from '../context/SocketRealtimeContext.jsx';

export default function KhachHangGoiMonQR({ tableId: propTableId, onExitToStaff }) {
  // Lấy mã bàn từ URL (?table=2 hoặc /table/2) hoặc từ prop
  const layMaBanBanDau = () => {
    if (propTableId) return propTableId;
    const urlParams = new URLSearchParams(window.location.search);
    const fromQuery = urlParams.get('table');
    if (fromQuery) return Number(fromQuery);
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(Number(lastPart)) && Number(lastPart) > 0) return Number(lastPart);
    return 1; // Mặc định bàn 1
  };

  const [tableId, setTableId] = useState(layMaBanBanDau);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'tracking'
  
  // Giỏ hàng
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Món đang xem để thêm
  const [customizingDish, setCustomizingDish] = useState(null);
  const [dishQty, setDishQty] = useState(1);
  const [dishNote, setDishNote] = useState('');
  const [dishOptions, setDishOptions] = useState({});

  // Đơn món đã gọi của bàn này (Live tracker)
  const [tableOrders, setTableOrders] = useState([]);
  
  // Modals
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Trạng thái thông báo hành động
  const [alertBanner, setAlertBanner] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const socketContext = useSocket();
  const socket = socketContext?.socket;

  // 1. Tải thông tin bàn, danh mục và thực đơn
  const fetchData = async () => {
    try {
      const [tableRes, catRes, dishRes] = await Promise.all([
        clientAxios.get(`/tables/${tableId}`).catch(() => null),
        clientAxios.get('/dishes/categories').catch(() => ({ categories: [] })),
        clientAxios.get('/dishes').catch(() => ({ dishes: [] }))
      ]);

      if (tableRes?.success) {
        setTable(tableRes.table);
      }
      if (catRes?.categories) {
        setCategories(catRes.categories);
      }
      if (dishRes?.dishes) {
        setDishes(dishRes.dishes);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang khách QR:', err);
    }
  };

  // 2. Tải danh sách món bàn này đã gọi
  const fetchTableOrders = async () => {
    try {
      const res = await clientAxios.get(`/orders?ban_id=${tableId}`);
      if (res?.success) {
        setTableOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn món của bàn:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTableOrders();
    const timer = setInterval(fetchTableOrders, 5000);
    return () => clearInterval(timer);
  }, [tableId]);

  // 3. Lắng nghe Socket để cập nhật trạng thái món thời gian thực
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    const handleOrderUpdated = (order) => {
      if (order.ban_id === tableId || order.so_ban === table?.so_ban) {
        fetchTableOrders();
        showNotification(`Món "${order.ten_mon}" đã chuyển sang: ${order.trang_thai}`);
      }
    };

    const handleTableUpdated = (updatedTable) => {
      if (updatedTable.id === tableId || updatedTable.so_ban === table?.so_ban) {
        setTable(updatedTable);
      }
    };

    socket.on('order:status_updated', handleOrderUpdated);
    socket.on('table:updated', handleTableUpdated);

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('order:status_updated', handleOrderUpdated);
        socket.off('table:updated', handleTableUpdated);
      }
    };
  }, [socket, tableId, table]);

  const showNotification = (msg, type = 'info') => {
    setAlertBanner({ message: msg, type });
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 4. Các thao tác Giỏ hàng
  const handleOpenCustomize = (dish) => {
    setCustomizingDish(dish);
    setDishQty(1);
    setDishNote('');
    // Khởi tạo options mặc định nếu có
    const initialOptions = {};
    if (dish.ten_mon.toLowerCase().includes('bò') || dish.ten_mon.toLowerCase().includes('wagyu') || dish.ten_mon.toLowerCase().includes('steak')) {
      initialOptions['Độ chín'] = 'Medium Rare';
      initialOptions['Sốt'] = 'Sốt Tiêu Đen';
    } else if (dish.ten_mon.toLowerCase().includes('lẩu')) {
      initialOptions['Nước lẩu'] = 'Cay vừa';
    } else if (dish.ten_mon.toLowerCase().includes('trà') || dish.ten_mon.toLowerCase().includes('uống')) {
      initialOptions['Đá'] = 'Ít đá';
      initialOptions['Đường'] = '70%';
    }
    setDishOptions(initialOptions);
  };

  const handleAddToCart = () => {
    if (!customizingDish) return;
    
    const cartItemId = `${customizingDish.id}_${JSON.stringify(dishOptions)}_${dishNote}`;
    const existingIndex = cart.findIndex(c => c.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].so_luong += dishQty;
      setCart(newCart);
    } else {
      setCart(prev => [
        ...prev,
        {
          cartItemId,
          mon_an_id: customizingDish.id,
          ten_mon: customizingDish.ten_mon,
          gia: customizingDish.gia,
          hinh_anh: customizingDish.hinh_anh,
          so_luong: dishQty,
          ghi_chu: dishNote,
          options: dishOptions
        }
      ]);
    }

    showNotification(`Đã thêm "${customizingDish.ten_mon}" vào giỏ hàng`, 'success');
    setCustomizingDish(null);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.so_luong + delta;
          return newQty > 0 ? { ...item, so_luong: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.gia * item.so_luong, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.so_luong, 0);

  // 5. Gửi đơn gọi món xuống Bếp
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    try {
      setLoadingOrder(true);
      const payload = {
        ban_id: tableId,
        items: cart.map(c => ({
          mon_an_id: c.mon_an_id,
          so_luong: c.so_luong,
          ghi_chu: c.ghi_chu,
          options: c.options
        }))
      };

      const res = await clientAxios.post('/orders', payload);
      if (res.success) {
        showNotification('🎉 Gọi món thành công! Bếp đã nhận được đơn của bạn.', 'success');
        setCart([]);
        setIsCartOpen(false);
        fetchTableOrders();
        setActiveTab('tracking');
      }
    } catch (err) {
      showNotification(err.message || 'Không thể gửi đơn món, vui lòng thử lại.', 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  // 6. Khách bấm nút gọi nhân viên
  const handleCallWaiter = async () => {
    try {
      const res = await clientAxios.post(`/tables/${tableId}/call-waiter`);
      if (res.success) {
        showNotification(res.message || '🔔 Đã gọi nhân viên phục vụ, xin vui lòng đợi giây lát!', 'success');
      }
    } catch (err) {
      showNotification('Không thể gọi nhân viên lúc này.', 'error');
    }
  };

  // 7. Khách bấm yêu cầu thanh toán
  const handleRequestPayment = async (method = 'chuyen_khoan') => {
    try {
      const res = await clientAxios.post(`/tables/${tableId}/request-payment`, { phuong_thuc: method });
      if (res.success) {
        showNotification(res.message || '💳 Đã gửi yêu cầu thanh toán tới Quầy Thu Ngân!', 'success');
        setIsBillModalOpen(true);
      }
    } catch (err) {
      showNotification('Lỗi khi gửi yêu cầu thanh toán.', 'error');
    }
  };

  // 8. Gửi đánh giá dịch vụ
  const handleSubmitReview = async () => {
    try {
      const res = await clientAxios.post(`/tables/${tableId}/review`, {
        ban_id: tableId,
        so_sao: reviewStars,
        noi_dung_danh_gia: reviewComment
      });
      if (res.success) {
        showNotification(res.message, res.canh_bao_do ? 'warning' : 'success');
        setIsReviewModalOpen(false);
        setReviewComment('');
      }
    } catch (err) {
      showNotification('Lỗi khi gửi đánh giá.', 'error');
    }
  };

  // Lọc món ăn hiển thị
  const filteredDishes = dishes.filter(d => {
    const matchCategory = selectedCategory === 'all' || d.loai_mon_id === Number(selectedCategory);
    const matchSearch = !searchQuery.trim() || 
      d.ten_mon.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (d.mo_ta && d.mo_ta.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const totalTableSpent = tableOrders
    .filter(o => o.trang_thai !== 'da_huy')
    .reduce((sum, o) => sum + (o.tong_tien || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-28 font-sans select-none antialiased">
      {/* 1. Header Cố Định Sang Trọng */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">ROYAL BISTRO</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  BÀN {table?.so_ban || tableId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                {table?.khu_vuc || 'Khu vực phục vụ khách'} • Gọi món tự động
              </p>
            </div>
          </div>

          {/* Nút hành động nhanh: Gọi nhân viên & Quay lại nếu là nhân viên test */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCallWaiter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black shadow-2xs transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce text-rose-600" />
              <span>Gọi Phục Vụ</span>
            </button>

            {onExitToStaff && (
              <button
                onClick={onExitToStaff}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
                title="Quay về giao diện nhân viên"
              >
                Thoát
              </button>
            )}
          </div>
        </div>

        {/* Banner thông báo nổi */}
        {alertBanner && (
          <div className={`mt-2.5 max-w-3xl mx-auto p-2.5 rounded-xl text-xs font-bold text-center border animate-fade-in shadow-md ${
            alertBanner.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
            alertBanner.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-300' :
            alertBanner.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-300' :
            'bg-sky-50 text-sky-800 border-sky-300'
          }`}>
            {alertBanner.message}
          </div>
        )}
      </header>

      {/* 2. Navigation Switcher: Thực đơn vs Món đã gọi */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-[65px] z-30 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'menu'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Thực Đơn Món Ăn</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'tracking'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Món Đã Gọi ({tableOrders.filter(o => o.trang_thai !== 'da_huy').length})</span>
            {tableOrders.some(o => o.trang_thai === 'dang_che_bien') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute right-3 top-2.5"></span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-5">
        {/* ======================= TAB 1: THỰC ĐƠN GỌI MÓN ======================= */}
        {activeTab === 'menu' && (
          <>
            {/* Thanh tìm kiếm */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm món ăn, đồ uống, hải sản..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dải Category Tags cuộn ngang */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất Cả ({dishes.length})
              </button>
              {categories.map(c => {
                const isSelected = selectedCategory === String(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.ten_loai}
                  </button>
                );
              })}
            </div>

            {/* Lưới danh sách món ăn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredDishes.map(dish => {
                const inCartItem = cart.find(c => c.mon_an_id === dish.id);
                const isOutOfStock = dish.trang_thai === 'het_hang' || dish.trang_thai === 'tam_ngung';

                return (
                  <div 
                    key={dish.id} 
                    className="bg-white border border-slate-200 rounded-3xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                  >
                    <div>
                      {/* Ảnh món ăn */}
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 relative mb-3">
                        <img 
                          src={dish.hinh_anh || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'} 
                          alt={dish.ten_mon} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {dish.ten_loai && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {dish.ten_loai}
                          </span>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center text-white text-xs font-black uppercase tracking-wider">
                            Tạm Hết Món
                          </div>
                        )}
                      </div>

                      {/* Tên & Giá */}
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">
                        {dish.ten_mon}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                        {dish.mo_ta || 'Món ăn thượng hạng được chế biến từ đầu bếp 5 sao.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                      <div className="font-black text-amber-800 text-sm">
                        {dinhDangTienTe(dish.gia)}
                      </div>

                      {isOutOfStock ? (
                        <span className="text-[11px] font-bold text-slate-400">Hết hàng</span>
                      ) : inCartItem ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-xl p-0.5">
                          <button
                            onClick={() => updateCartQty(inCartItem.cartItemId, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center font-black text-xs hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-amber-900 px-1">{inCartItem.so_luong}</span>
                          <button
                            onClick={() => updateCartQty(inCartItem.cartItemId, 1)}
                            className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs hover:bg-amber-400 transition-colors shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenCustomize(dish)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ======================= TAB 2: THEO DÕI MÓN ĐÃ GỌI ======================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {/* Tóm tắt chi phí bàn */}
            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Tạm Tính Bàn {table?.so_ban || tableId}</p>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {dinhDangTienTe(totalTableSpent)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Đã phục vụ {tableOrders.filter(o => o.trang_thai === 'hoan_thanh' || o.trang_thai === 'da_phuc_vu').length} / {tableOrders.length} món
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsBillModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 active:scale-95"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Xem Hóa Đơn & QR</span>
                </button>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Đánh Giá Bữa Ăn</span>
                </button>
              </div>
            </div>

            {/* Danh sách các món đang nấu / đã phục vụ */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                Tiến Độ Chế Biến Tại Bếp ({tableOrders.length} món)
              </h4>

              {tableOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 text-xs">
                  Bàn chưa gọi món nào. Hãy chọn món từ thực đơn và bấm gửi đơn nhé!
                </div>
              ) : (
                tableOrders.map(order => {
                  let statusLabel = 'Chờ bếp nhận';
                  let statusBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  let icon = Clock;

                  if (order.trang_thai === 'dang_che_bien') {
                    statusLabel = 'Bếp đang nấu...';
                    statusBg = 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
                    icon = Flame;
                  } else if (order.trang_thai === 'da_phuc_vu') {
                    statusLabel = 'Đã bưng ra bàn';
                    statusBg = 'bg-sky-100 text-sky-900 border-sky-300';
                    icon = CheckCircle;
                  } else if (order.trang_thai === 'hoan_thanh') {
                    statusLabel = 'Đã hoàn tất';
                    statusBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                    icon = CheckCircle;
                  } else if (order.trang_thai === 'da_huy') {
                    statusLabel = 'Đã hủy';
                    statusBg = 'bg-rose-100 text-rose-900 border-rose-300';
                    icon = AlertTriangle;
                  }

                  const StatusIcon = icon;

                  return (
                    <div 
                      key={order.id} 
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <img 
                            src={order.hinh_anh || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'} 
                            alt={order.ten_mon} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-900">
                            {order.ten_mon} <span className="text-amber-800">x{order.so_luong}</span>
                          </h5>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {dinhDangTienTe(order.tong_tien)}
                          </p>
                          {order.ghi_chu && (
                            <span className="inline-block text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                              Ghi chú: {order.ghi_chu}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${statusBg}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Thanh Giỏ Hàng Nổi Phía Dưới (Bottom Floating Cart Bar) */}
      {cart.length > 0 && activeTab === 'menu' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto animate-slide-up">
          <div className="bg-slate-950 text-white rounded-3xl p-3.5 shadow-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3 pl-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-950">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <div className="text-sm font-black text-white">{dinhDangTienTe(totalCartPrice)}</div>
                <p className="text-[10px] text-slate-400 font-medium">Bàn {table?.so_ban || tableId} • Chưa gửi bếp</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Xem Giỏ
              </button>
              <button
                disabled={loadingOrder}
                onClick={handleSubmitOrder}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>{loadingOrder ? 'Đang gửi...' : 'Gửi Bếp Nấu'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Xem và Sửa Giỏ Hàng (Cart Drawer Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Giỏ Hàng Món Ăn</h3>
                <p className="text-xs text-slate-500">Bàn {table?.so_ban || tableId} • {totalCartCount} phần món</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {cart.map(item => (
                <div key={item.cartItemId} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img src={item.hinh_anh} alt={item.ten_mon} className="w-12 h-12 rounded-xl object-cover bg-slate-200" />
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{item.ten_mon}</h5>
                      <p className="text-xs text-amber-800 font-bold">{dinhDangTienTe(item.gia)}</p>
                      {item.ghi_chu && <span className="text-[10px] text-amber-700 italic">*{item.ghi_chu}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.cartItemId, -1)}
                      className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xs hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-slate-900 w-4 text-center">{item.so_luong}</span>
                    <button
                      onClick={() => updateCartQty(item.cartItemId, 1)}
                      className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs hover:bg-amber-400"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">Tổng cộng giỏ hàng:</span>
                <span className="text-lg font-black text-slate-900">{dinhDangTienTe(totalCartPrice)}</span>
              </div>
              <button
                disabled={loadingOrder}
                onClick={handleSubmitOrder}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{loadingOrder ? 'Đang gửi order xuống bếp...' : 'Xác Nhận & Gửi Order Xuống Bếp'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Tùy biến món ăn (Customize Options Modal) */}
      {customizingDish && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={customizingDish.hinh_anh} alt={customizingDish.ten_mon} className="w-14 h-14 rounded-2xl object-cover bg-slate-100" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{customizingDish.ten_mon}</h3>
                  <div className="text-sm font-black text-amber-800">{dinhDangTienTe(customizingDish.gia)}</div>
                </div>
              </div>
              <button onClick={() => setCustomizingDish(null)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Các tùy chọn mẫu khẩu vị */}
            <div className="space-y-3 pt-2 text-xs">
              {Object.keys(dishOptions).map(optKey => (
                <div key={optKey} className="space-y-1.5">
                  <label className="font-bold text-slate-700">{optKey}:</label>
                  <div className="flex flex-wrap gap-2">
                    {optKey === 'Độ chín' && ['Rare', 'Medium Rare', 'Well Done'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDishOptions(prev => ({ ...prev, [optKey]: val }))}
                        className={`px-3 py-1.5 rounded-xl font-bold border ${
                          dishOptions[optKey] === val ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {optKey === 'Sốt' && ['Sốt Tiêu Đen', 'Sốt Bơ Tỏi', 'Sốt Nấm'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDishOptions(prev => ({ ...prev, [optKey]: val }))}
                        className={`px-3 py-1.5 rounded-xl font-bold border ${
                          dishOptions[optKey] === val ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {optKey === 'Đá' && ['Ít đá', 'Đá vừa', 'Không đá'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDishOptions(prev => ({ ...prev, [optKey]: val }))}
                        className={`px-3 py-1.5 rounded-xl font-bold border ${
                          dishOptions[optKey] === val ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {optKey === 'Đường' && ['30%', '50%', '70%', '100%'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDishOptions(prev => ({ ...prev, [optKey]: val }))}
                        className={`px-3 py-1.5 rounded-xl font-bold border ${
                          dishOptions[optKey] === val ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Ô ghi chú thêm */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Lời nhắn cho đầu bếp:</label>
                <input
                  type="text"
                  value={dishNote}
                  onChange={(e) => setDishNote(e.target.value)}
                  placeholder="Ví dụ: Nấu ít cay, không hành tây..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bộ điều khiển số lượng & Nút thêm vào giỏ */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDishQty(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 font-black text-sm flex items-center justify-center hover:bg-slate-200"
                >
                  -
                </button>
                <span className="font-black text-sm w-5 text-center">{dishQty}</span>
                <button
                  onClick={() => setDishQty(prev => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-100 font-black text-sm flex items-center justify-center hover:bg-slate-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 ml-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95"
              >
                Thêm Vào Giỏ • {dinhDangTienTe(customizingDish.gia * dishQty)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Đánh giá chất lượng dịch vụ */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Đánh Giá Bữa Ăn</h3>
              <p className="text-xs text-slate-500 mt-1">Cảm nhận của quý khách giúp nhà hàng phục vụ tốt hơn!</p>
            </div>

            {/* Chọn số sao */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewStars(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={`w-7 h-7 ${star <= reviewStars ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ nhận xét về món ăn, nhân viên phục vụ..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-amber-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
              >
                Gửi Nhận Xét
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal Hóa Đơn & Thanh toán VietQR (SỬ DỤNG ẢNH QR CHUẨN CỦA NHÀ HÀNG) */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-slate-900">Chi Tiết Hóa Đơn</h3>
              </div>
              <button onClick={() => setIsBillModalOpen(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto text-xs font-mono">
              {tableOrders.filter(o => o.trang_thai !== 'da_huy').map(order => (
                <div key={order.id} className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="truncate pr-2">{order.ten_mon} x{order.so_luong}</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">{dinhDangTienTe(order.tong_tien)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-600 text-xs">Tổng Thanh Toán:</span>
              <span className="font-black text-slate-900 text-lg">{dinhDangTienTe(totalTableSpent)}</span>
            </div>

            {/* VietQR Quick Payment - SỬ DỤNG ẢNH QR CHUẨN DO NGƯỜI DÙNG CUNG CẤP (/ma_qr.jpg) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <p className="text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                Quét Mã VietQR Chuyển Khoản Trực Tiếp
              </p>
              <img 
                src="/ma_qr.jpg"
                alt="Mã QR Chuyển Khoản Nhà Hàng"
                className="w-44 h-44 mx-auto rounded-xl border border-slate-200 shadow-sm object-contain bg-white p-1"
              />
              <p className="text-[11px] text-slate-500 font-mono">Chủ tài khoản: ROYAL BISTRO RESTAURANT</p>
              <p className="text-[11px] font-bold text-amber-700">Nội dung CK: BAN{table?.so_ban || tableId} - {dinhDangTienTe(totalTableSpent)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleRequestPayment('tien_mat')}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black"
              >
                💵 Trả Tiền Mặt
              </button>

              <button
                onClick={() => handleRequestPayment('chuyen_khoan')}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
              >
                ✅ Đã Chuyển Khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bí danh tương thích
export const CustomerQROrder = KhachHangGoiMonQR;
