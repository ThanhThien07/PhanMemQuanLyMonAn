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
  ShoppingBag, Plus, Minus, X, Star, AlertTriangle, QrCode, Sparkles, Flame, User, Search,
  LayoutGrid, Users, Check, Copy, ChevronDown, CreditCard, ArrowRightLeft, Building2,
  LogIn, LogOut, LayoutDashboard, Lock, ShieldCheck, Grid3X3, Trash2
} from 'lucide-react';
import clientAxios from '../services/cauHinhAxiosApi.js';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu.js';
import { useSocket } from '../context/SocketRealtimeContext.jsx';
import { useAuth } from '../context/NguoiDungContext.jsx';
import { useToast } from '../context/ThongBaoToastContext.jsx';
import anhMaQr from '../../assets/ma_qr.jpg';
import ThanhCuonNgang from '../common/ThanhCuonNgang.jsx';

// Cấu hình thông tin tài khoản ngân hàng liên kết chính thức của nhà hàng (MB Bank)
const THONG_TIN_NGAN_HANG = {
  tenNganHang: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  maBin: '970422',
  soTaiKhoan: '0374685094',
  chuTaiKhoan: 'ROYAL BISTRO (NGUYEN NGOC HA THAO)'
};

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
  const [allTables, setAllTables] = useState([]);
  const [isTableMapOpen, setIsTableMapOpen] = useState(false);
  const [selectedTableArea, setSelectedTableArea] = useState('all');
  
  // Trạng thái thanh toán chuyển khoản ngân hàng
  const [qrViewMode, setQrViewMode] = useState('dynamic'); // 'dynamic' (VietQR tự điền số tiền) | 'static' (QR gốc MB Bank)
  const [copiedField, setCopiedField] = useState(null);
  const [hasPaidOnline, setHasPaidOnline] = useState(false);

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

  // Quản lý phiên đăng nhập Quản Trị / Nhân Viên
  const authContext = useAuth();
  const currentUser = authContext?.user;
  const login = authContext?.login;
  const quickLoginAs = authContext?.quickLoginAs;
  const logout = authContext?.logout;

  // Modal Đăng Nhập Quản Trị
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleGoToDashboard = () => {
    if (onExitToStaff) {
      onExitToStaff();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('table');
      url.searchParams.set('tab', 'tables');
      url.pathname = '/';
      window.location.href = url.toString();
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    try {
      setLoginError('');
      setIsLoggingIn(true);
      if (quickLoginAs) {
        await quickLoginAs(demoEmail);
      } else if (login) {
        await login(demoEmail, '123456');
      }
      showNotification('🎉 Đăng nhập thành công! Đang chuyển hướng vào hệ thống...', 'success');
      setIsLoginModalOpen(false);
      setTimeout(() => {
        handleGoToDashboard();
      }, 500);
    } catch (err) {
      setLoginError(err.message || 'Đăng nhập không thành công.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    try {
      setLoginError('');
      setIsLoggingIn(true);
      await login(loginEmail, loginPassword);
      showNotification('🎉 Đăng nhập thành công! Đang chuyển hướng vào hệ thống...', 'success');
      setIsLoginModalOpen(false);
      setTimeout(() => {
        handleGoToDashboard();
      }, 500);
    } catch (err) {
      setLoginError(err.message || 'Đăng nhập không thành công.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const toast = useToast();

  // 1. Tải thông tin bàn, danh mục, thực đơn và toàn bộ danh sách bàn phục vụ sơ đồ chọn bàn
  const fetchData = async () => {
    try {
      const [tableRes, catRes, dishRes, allTablesRes] = await Promise.all([
        clientAxios.get(`/tables/${tableId}`).catch(() => null),
        clientAxios.get('/dishes/categories').catch(() => ({ categories: [] })),
        clientAxios.get('/dishes').catch(() => ({ dishes: [] })),
        clientAxios.get('/tables').catch(() => ({ tables: [] }))
      ]);

      if (tableRes?.success) {
        setTable(tableRes.table);
      }
      if (allTablesRes?.tables) {
        setAllTables(allTablesRes.tables);
        // Nếu tableRes chưa tìm được nhưng allTables có bàn tương ứng
        if (!tableRes?.success) {
          const timThay = allTablesRes.tables.find(t => t.id === Number(tableId) || t.so_ban === Number(tableId));
          if (timThay) setTable(timThay);
        }
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

  /**
   * Khách chọn chuyển đổi bàn ăn trên Sơ đồ bàn
   */
  const handleSelectTable = (newTable) => {
    setTableId(newTable.id);
    setTable(newTable);
    // Cập nhật tham số query trên URL mà không gây tải lại trang
    const url = new URL(window.location.href);
    url.searchParams.set('table', newTable.so_ban);
    window.history.pushState({}, '', url.toString());
    setIsTableMapOpen(false);
  };

  /**
   * Sao chép thông tin tài khoản ngân hàng / nội dung chuyển khoản 1-Click
   */
  const copyToClipboard = (text, fieldName) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(String(text));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = String(text);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Fallback
    }
  };

  // 2. Tải danh sách món bàn này đã gọi (chỉ lấy các món chưa thanh toán trong phiên hiện tại)
  const fetchTableOrders = async () => {
    try {
      if (table?.trang_thai === 'trong') {
        setTableOrders([]);
        return;
      }
      const res = await clientAxios.get(`/orders?ban_id=${tableId}&unpaid_only=true`);
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
        if (order.trang_thai === 'da_xoa') {
          setTableOrders(prev => prev.filter(o => o.id !== order.id));
        } else {
          fetchTableOrders();
        }
      }
    };

    const handleTableUpdated = (updatedTable) => {
      if (updatedTable.id === tableId || updatedTable.so_ban === table?.so_ban) {
        setTable(updatedTable);
        // Khi Admin / Nhân viên giải phóng bàn về trạng thái 'trong':
        // Lập tức RESET toàn bộ dữ liệu bàn của khách (đơn món, giỏ hàng, hóa đơn tạm, modal)
        if (updatedTable.trang_thai === 'trong') {
          setTableOrders([]);
          setCart([]);
          setHasPaidOnline(false);
          setIsBillModalOpen(false);
          setIsReviewModalOpen(false);
          setCustomizingDish(null);
        } else {
          fetchTableOrders();
        }
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

  /**
   * Hiển thị thông báo. Theo yêu cầu: Chỉ khi bấm gọi phục vụ thì mới hiện thông báo nổi (toast)
   * Các thao tác thông thường của khách (thêm giỏ hàng, xóa món, xem bill) không hiện thông báo nổi.
   */
  const showNotification = (msg, type = 'info', laGoiPhucVu = false) => {
    if (laGoiPhucVu) {
      if (type === 'success') {
        toast.thanhCong(msg, 'Thành Công', 3000);
      } else if (type === 'error') {
        toast.loi(msg, 'Thông Báo Lỗi', 3000);
      } else {
        toast.thongTin(msg, 'Thông Báo', 3000);
      }
    }
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
        setCart([]);
        setIsCartOpen(false);
        fetchTableOrders();
        setActiveTab('tracking');
      }
    } catch (err) {
      alert(err.message || 'Không thể gửi đơn món, vui lòng thử lại.');
    } finally {
      setLoadingOrder(false);
    }
  };

  // 6. Khách bấm nút gọi nhân viên (DUY NHẤT hành động này phát chuông & hiển thị thông báo)
  const handleCallWaiter = async () => {
    try {
      const res = await clientAxios.post(`/tables/${tableId}/call-waiter`);
      if (res.success) {
        showNotification(res.message || '🔔 Đã gọi nhân viên phục vụ, xin vui lòng đợi giây lát!', 'success', true);
      }
    } catch (err) {
      showNotification('Không thể gọi nhân viên lúc này.', 'error', true);
    }
  };

  // 6b. Khách xóa món khỏi đơn đã gọi
  const handleXoaMon = async (order) => {
    const tenMon = order.ten_mon || 'Món ăn';
    const xacNhan = window.confirm(`Bạn có chắc chắn muốn xóa món "${tenMon}" khỏi danh sách đã gọi không?`);
    if (!xacNhan) return;

    try {
      const res = await clientAxios.delete(`/orders/${order.id}`);
      if (res.success) {
        setTableOrders(prev => prev.filter(o => o.id !== order.id));
        fetchTableOrders();
      }
    } catch (err) {
      alert(err.message || 'Không thể xóa món này lúc này.');
    }
  };

  // 7. Khách bấm yêu cầu thanh toán
  const handleRequestPayment = async (method = 'chuyen_khoan') => {
    try {
      const res = await clientAxios.post(`/tables/${tableId}/request-payment`, { phuong_thuc: method });
      if (res.success) {
        if (method === 'chuyen_khoan') {
          setHasPaidOnline(true);
        }
        setIsBillModalOpen(true);
      }
    } catch (err) {
      alert('Lỗi khi gửi yêu cầu thanh toán: ' + (err.message || ''));
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 whitespace-nowrap">ROYAL BISTRO</span>
                <button
                  onClick={() => setIsTableMapOpen(true)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Bấm để đổi số bàn ăn"
                >
                  <span>BÀN {table?.so_ban || tableId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                </button>
                <button
                  onClick={() => setIsTableMapOpen(true)}
                  className="hidden sm:flex px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Xem toàn bộ sơ đồ bàn"
                >
                  <LayoutGrid className="w-3 h-3 text-slate-600" />
                  <span>Sơ Đồ Bàn</span>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-none">
                {table?.khu_vuc || 'Khu vực phục vụ khách'} • Gọi món tự động
              </p>
            </div>
          </div>

          {/* Nút hành động nhanh: Gọi nhân viên, Đăng Nhập / Vào Quản Trị */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={handleCallWaiter}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Gọi nhân viên phục vụ"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce text-rose-600" />
              <span className="hidden sm:inline">Gọi Phục Vụ</span>
              <span className="sm:hidden text-2xs">Gọi NV</span>
            </button>

            {/* Chỗ Đăng Nhập / Vào Quản Trị theo yêu cầu */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <div className="hidden md:flex flex-col text-right px-1.5">
                  <span className="text-[11px] font-black text-slate-900 leading-tight truncate max-w-[200px]">
                    {currentUser.name || currentUser.ho_ten || 'Khách Hàng'}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold capitalize">
                    {currentUser.role === 'admin' || currentUser.vai_tro === 'admin'
                      ? 'Quản lý'
                      : currentUser.role === 'bep' || currentUser.vai_tro === 'bep'
                      ? 'Đầu bếp'
                      : currentUser.role === 'khach_hang' || currentUser.vai_tro === 'khach_hang'
                      ? 'Khách Hàng'
                      : 'Thu ngân / Phục vụ'}
                  </span>
                </div>
                {/* Chỉ nhân viên/quản lý mới có nút Về Sơ Đồ Bàn, Khách hàng tuyệt đối không hiển thị */}
                {currentUser.role !== 'khach_hang' && currentUser.vai_tro !== 'khach_hang' && (
                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Quay lại sơ đồ bàn nhân viên"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Về Sơ Đồ Bàn</span>
                    <span className="sm:hidden">Sơ Đồ Bàn</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 text-xs transition-all cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLoginError('');
                  setIsLoginModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Đăng nhập tài khoản Quản lý, Thu ngân, Bếp"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {onExitToStaff && !currentUser && (
              <button
                type="button"
                onClick={onExitToStaff}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                title="Quay về giao diện sơ đồ bàn"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Sơ Đồ Bàn</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner thông báo nổi */}
        {alertBanner && (
          <div className={`mt-2.5 max-w-6xl mx-auto p-2.5 rounded-xl text-xs font-bold text-center border animate-fade-in shadow-md ${
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
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 sticky top-[65px] z-30 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Thực Đơn Món Ăn</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Món Đã Gọi ({tableOrders.filter(o => o.trang_thai !== 'da_huy').length})</span>
            {tableOrders.some(o => o.trang_thai === 'dang_che_bien') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute right-2.5 top-2.5"></span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ======================= TAB 1: THỰC ĐƠN GỌI MÓN ======================= */}
        {activeTab === 'menu' && (
          <>
            {/* Thanh tìm kiếm */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm món ăn, đồ uống, hải sản..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dải Category Tags cuộn ngang với hỗ trợ Kéo chuột, Lăn chuột & Nút điều hướng */}
            <ThanhCuonNgang fadeColor="from-slate-100" scrollStep={280}>
              <button
                type="button"
                onClick={(e) => {
                  setSelectedCategory('all');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
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
                    type="button"
                    onClick={(e) => {
                      setSelectedCategory(String(c.id));
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.ten_loai}
                  </button>
                );
              })}
            </ThanhCuonNgang>

            {/* Lưới danh sách món ăn mở rộng 4 cột trên Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredDishes.map((dish, index) => {
                const inCartItem = cart.find(c => c.mon_an_id === dish.id);
                const isOutOfStock = dish.trang_thai === 'het_hang' || dish.trang_thai === 'tam_ngung';

                return (
                  <div 
                    key={dish.id} 
                    className="bg-white border border-slate-200 rounded-3xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                  >
                    <div>
                      {/* Ảnh món ăn tối ưu Core Web Vitals (Slide 8 & Slide 9) */}
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 relative mb-3">
                        <img 
                          src={dish.hinh_anh || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'} 
                          alt={dish.ten_mon} 
                          width="320"
                          height="144"
                          loading={index < 4 ? "eager" : "lazy"}
                          decoding="async"
                          fetchpriority={index === 0 ? "high" : "auto"}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
                          }}
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
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2 min-h-[40px]">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột trái: Tóm tắt chi phí bàn & Hành động nhanh */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-[125px]">
              <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tổng Tạm Tính Bàn {table?.so_ban || tableId}
                  </p>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {dinhDangTienTe(totalTableSpent)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Đã phục vụ {tableOrders.filter(o => o.trang_thai === 'hoan_thanh' || o.trang_thai === 'da_phuc_vu').length} / {tableOrders.length} món
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsBillModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Xem Hóa Đơn & QR Thanh Toán</span>
                  </button>

                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Đánh Giá Bữa Ăn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cột phải: Danh sách các món đang nấu / đã phục vụ */}
            <div className="lg:col-span-7 space-y-3">
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
                            width="48"
                            height="48"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
                            }}
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

                      <div className="text-right flex flex-col items-end">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${statusBg}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Nút xóa món khỏi đơn đã gọi */}
                        {order.phuong_thuc_thanh_toan === 'chua_thanh_toan' && order.trang_thai !== 'hoan_thanh' && (
                          <button
                            type="button"
                            onClick={() => handleXoaMon(order)}
                            className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                            title="Xóa món này khỏi đơn đã gọi"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>Xóa món</span>
                          </button>
                        )}
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
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto animate-slide-up">
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
                    <img 
                      src={item.hinh_anh || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'} 
                      alt={item.ten_mon} 
                      width="48" 
                      height="48" 
                      loading="lazy" 
                      decoding="async" 
                      className="w-12 h-12 rounded-xl object-cover bg-slate-200" 
                    />
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
                <img 
                  src={customizingDish.hinh_anh || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'} 
                  alt={customizingDish.ten_mon} 
                  width="56" 
                  height="56" 
                  loading="lazy" 
                  decoding="async" 
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100" 
                />
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

      {/* 8. Modal Hóa Đơn & Thanh toán Chuyển Khoản Ngân Hàng (MB Bank & VietQR) */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-slate-900">Chi Tiết Hóa Đơn - Bàn {table?.so_ban || tableId}</h3>
              </div>
              <button onClick={() => { setIsBillModalOpen(false); setHasPaidOnline(false); }} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danh sách các món ăn đã gọi */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs font-mono pr-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {tableOrders.filter(o => o.trang_thai !== 'da_huy').length > 0 ? (
                tableOrders.filter(o => o.trang_thai !== 'da_huy').map(order => (
                  <div key={order.id} className="flex justify-between items-center py-1 border-b border-dashed border-slate-200 last:border-0">
                    <span className="truncate pr-2 font-medium">{order.ten_mon} <strong className="text-amber-800">x{order.so_luong}</strong></span>
                    <span className="font-bold text-slate-900 whitespace-nowrap">{dinhDangTienTe(order.tong_tien)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-slate-400 text-xs">Chưa có món nào được ghi nhận cho bàn này</div>
              )}
            </div>

            {/* Tổng thanh toán */}
            <div className="pt-1 flex justify-between items-center">
              <span className="font-bold text-slate-600 text-xs">Tổng Số Tiền Cần Trả:</span>
              <span className="font-black text-rose-600 text-xl">{dinhDangTienTe(totalTableSpent)}</span>
            </div>

            {/* THẺ THANH TOÁN CHUYỂN KHOẢN NGÂN HÀNG & MÃ QR */}
            <div className="p-3.5 bg-gradient-to-b from-blue-50/60 to-slate-50 rounded-2xl border border-blue-200 text-center space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between pb-1 border-b border-blue-100">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Chuyển Khoản Ngân Hàng (VietQR)</span>
                </div>
                {/* Nút chuyển tab QR */}
                <div className="flex rounded-lg bg-blue-100/80 p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setQrViewMode('dynamic')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      qrViewMode === 'dynamic' ? 'bg-white text-blue-800 shadow-2xs font-black' : 'text-slate-600'
                    }`}
                  >
                    Tự Điền Tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrViewMode('static')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      qrViewMode === 'static' ? 'bg-white text-blue-800 shadow-2xs font-black' : 'text-slate-600'
                    }`}
                  >
                    Mã MB Gốc
                  </button>
                </div>
              </div>

              {/* Hình ảnh Mã QR */}
              <div className="relative inline-block">
                <img 
                  src={
                    qrViewMode === 'dynamic' && totalTableSpent > 0
                      ? `https://img.vietqr.io/image/${THONG_TIN_NGAN_HANG.maBin}-${THONG_TIN_NGAN_HANG.soTaiKhoan}-compact2.png?amount=${totalTableSpent}&addInfo=${encodeURIComponent(`BAN${table?.so_ban || tableId} THANH TOAN`)}&accountName=${encodeURIComponent(THONG_TIN_NGAN_HANG.chuTaiKhoan)}`
                      : anhMaQr
                  }
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = anhMaQr;
                  }}
                  alt="Mã QR Chuyển Khoản Ngân Hàng"
                  width="176"
                  height="176"
                  loading="eager"
                  decoding="async"
                  className="w-44 h-44 mx-auto rounded-2xl border-2 border-blue-300 shadow-md object-contain bg-white p-1.5 transition-all"
                />
                <div className="text-[10px] text-blue-700 font-bold mt-1">
                  {qrViewMode === 'dynamic' ? '⚡ Quét mã trên app ngân hàng để tự động điền số tiền' : '📌 Quét mã QR MB Bank chính thức của nhà hàng'}
                </div>
              </div>

              {/* Bảng thông tin tài khoản ngân hàng chi tiết */}
              <div className="bg-white rounded-xl p-2.5 border border-blue-200 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Ngân Hàng:</span>
                  <span className="font-bold text-slate-800 text-[11px]">{THONG_TIN_NGAN_HANG.tenNganHang}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Số Tài Khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black font-mono text-blue-700 text-sm tracking-wider">{THONG_TIN_NGAN_HANG.soTaiKhoan}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(THONG_TIN_NGAN_HANG.soTaiKhoan, 'Số tài khoản')}
                      className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-0.5 transition-all cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'Số tài khoản' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Số tài khoản' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Chủ Tài Khoản:</span>
                  <span className="font-bold text-slate-900 text-[11px]">{THONG_TIN_NGAN_HANG.chuTaiKhoan}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Số Tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-rose-600 text-xs">{dinhDangTienTe(totalTableSpent)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(totalTableSpent, 'Số tiền')}
                      className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-0.5 transition-all cursor-pointer"
                    >
                      {copiedField === 'Số tiền' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Số tiền' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                  <span className="text-slate-500 text-[11px]">Nội Dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-amber-800 text-[11px]">BAN{table?.so_ban || tableId} THANH TOAN</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`BAN${table?.so_ban || tableId} THANH TOAN`, 'Nội dung CK')}
                      className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-0.5 transition-all cursor-pointer"
                    >
                      {copiedField === 'Nội dung CK' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Nội dung CK' ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {hasPaidOnline && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold text-center animate-fade-in">
                  🎉 Đã ghi nhận thông báo chuyển khoản! Quầy Thu Ngân đang xác nhận và in hóa đơn cho bàn của Quý khách.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleRequestPayment('tien_mat')}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all"
              >
                💵 Trả Tiền Mặt
              </button>

              <button
                onClick={() => handleRequestPayment('chuyen_khoan')}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Tôi Đã Chuyển Khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL SƠ ĐỒ CHỌN BÀN ĂN (TABLE MAP PICKER) */}
      {isTableMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900">Sơ Đồ Chọn Bàn Ăn</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Chọn bàn bạn đang ngồi để hệ thống gửi món chính xác tới bàn của bạn
                </p>
              </div>
              <button 
                onClick={() => setIsTableMapOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dải lọc theo Khu Vực */}
            <ThanhCuonNgang fadeColor="from-white" scrollStep={200}>
              {['all', ...new Set(allTables.map(t => t.khu_vuc).filter(Boolean))].map((khuVuc) => (
                <button
                  key={khuVuc}
                  type="button"
                  onClick={(e) => {
                    setSelectedTableArea(khuVuc);
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTableArea === khuVuc
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {khuVuc === 'all' ? `Tất Cả (${allTables.length} bàn)` : khuVuc}
                </button>
              ))}
            </ThanhCuonNgang>

            {/* Chú thích màu sắc */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bàn trống (Sẵn sàng)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Đang có khách
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Đã đặt trước
              </span>
            </div>

            {/* Lưới các bàn */}
            <div className="overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {allTables
                  .filter(t => selectedTableArea === 'all' || t.khu_vuc === selectedTableArea)
                  .map(ban => {
                    const isCurrent = ban.id === Number(tableId) || ban.so_ban === Number(table?.so_ban || tableId);
                    const isBusy = ban.trang_thai === 'co_khach' || ban.trang_thai === 'dang_dung';
                    const isReserved = ban.trang_thai === 'da_dat';

                    return (
                      <div
                        key={ban.id}
                        onClick={() => handleSelectTable(ban)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between h-28 hover:scale-[1.02] active:scale-95 ${
                          isCurrent
                            ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                            : isBusy
                            ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                            : isReserved
                            ? 'border-sky-200 bg-sky-50/40 hover:border-sky-300'
                            : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                            ★ Đang Chọn
                          </span>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            BÀN {ban.so_ban}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                            <Users className="w-3 h-3 text-slate-400" />
                            {ban.suc_chua}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          {ban.khu_vuc}
                        </div>

                        <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                          <span className={`text-[11px] font-bold ${
                            isBusy ? 'text-amber-700' : isReserved ? 'text-sky-700' : 'text-emerald-700'
                          }`}>
                            {isBusy ? '🟡 Có khách' : isReserved ? '🔵 Đã đặt' : '🟢 Bàn trống'}
                          </span>
                          <span className="text-[10px] font-black text-amber-700 hover:underline">
                            Chọn →
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Đang chọn: <strong className="text-slate-900">Bàn {table?.so_ban || tableId}</strong></span>
              <button
                type="button"
                onClick={() => setIsTableMapOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
              >
                Xác Nhận & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL ĐĂNG NHẬP DÀNH CHO QUẢN TRỊ / NHÂN VIÊN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Header modal */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#023E8A] to-[#00B4D8] flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Đăng Nhập Quản Trị</h3>
                  <p className="text-xs text-slate-500 font-medium">Royal Bistro Management Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông báo lỗi nếu có */}
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Khối Đăng Nhập Nhanh 1-Click Demo */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Đăng Nhập Nhanh 1-Click (Demo)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleQuickLogin('admin@nhahang.com')}
                  className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Đăng nhập tài khoản Quản lý"
                >
                  <span className="text-base">👑</span>
                  <span className="text-[11px] font-black">Quản Lý</span>
                  <span className="text-[9px] text-amber-700 font-mono">Admin</span>
                </button>

                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleQuickLogin('thungan@nhahang.com')}
                  className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Đăng nhập tài khoản Thu ngân"
                >
                  <span className="text-base">💵</span>
                  <span className="text-[11px] font-black">Thu Ngân</span>
                  <span className="text-[9px] text-blue-700 font-mono">Cashier</span>
                </button>

                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleQuickLogin('bep@nhahang.com')}
                  className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Đăng nhập tài khoản Bếp"
                >
                  <span className="text-base">👨‍🍳</span>
                  <span className="text-[11px] font-black">Bếp Trưởng</span>
                  <span className="text-[9px] text-emerald-700 font-mono">Kitchen</span>
                </button>

                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleQuickLogin('phucvu@nhahang.com')}
                  className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Đăng nhập tài khoản Phục Vụ"
                >
                  <span className="text-base">🛎️</span>
                  <span className="text-[11px] font-black">Phục Vụ</span>
                  <span className="text-[9px] text-purple-700 font-mono">Staff</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Hoặc tài khoản riêng
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Form đăng nhập thông thường */}
            <form onSubmit={handleCustomLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng nhập:</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@nhahang.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span>Đang xác thực đăng nhập...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Vào Hệ Thống</span>
                  </>
                )}
              </button>
            </form>

            {/* Link chuyển sang trang đăng nhập đầy đủ */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/?tab=tables';
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Mở giao diện quản lý sơ đồ bàn →
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
