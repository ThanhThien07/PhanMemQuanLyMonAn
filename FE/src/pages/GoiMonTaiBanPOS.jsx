/**
 * @file GoiMonTaiBanPOS.jsx
 * @description Màn hình Thu Ngân & Gọi Món Tại Bàn (POS Order) dành cho nhân viên phục vụ / thu ngân.
 * Cho phép chọn bàn, tìm kiếm món ăn theo danh mục, thêm ghi chú chi tiết, gửi món đến KDS bếp thời gian thực và thanh toán hóa đơn.
 * @module pages/GoiMonTaiBanPOS
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { 
  Search, 
  Plus, 
  Minus, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  Utensils, 
  Users 
} from 'lucide-react';
import ModalInHoaDon from '../components/ModalInHoaDon';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component màn hình gọi món POS tại quầy / bàn
 */
export default function GoiMonTaiBanPOS() {
  // Danh sách phân loại món ăn
  const [danhMuc, setDanhMuc] = useState([]);
  // Danh sách tất cả món ăn trong thực đơn
  const [danhSachMon, setDanhSachMon] = useState([]);
  // Danh sách bàn ăn trong nhà hàng
  const [danhSachBan, setDanhSachBan] = useState([]);
  // Danh mục đang được chọn lọc ('all' hoặc id loại)
  const [danhMucChon, setDanhMucChon] = useState('all');
  // Từ khóa tìm kiếm món ăn
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  // Bàn ăn đang được thao tác gọi món
  const [banHienTai, setBanHienTai] = useState(null);
  // Giỏ hàng món mới chuẩn bị gửi vào bếp
  const [gioHang, setGioHang] = useState([]);
  // Danh sách các đơn món đang phục vụ tại bàn hiện tại
  const [monDangPhucVu, setMonDangPhucVu] = useState([]);
  // Trạng thái đang xử lý tải dữ liệu
  const [dangXuLy, setDangXuLy] = useState(false);
  // Hiển thị thông báo gửi bếp thành công
  const [thanhCong, setThanhCong] = useState(false);
  // Điều khiển hiển thị modal in hóa đơn & thanh toán
  const [hienModalHoaDon, setHienModalHoaDon] = useState(false);

  /**
   * Tải toàn bộ dữ liệu ban đầu gồm phân loại món, món ăn và danh sách bàn
   */
  const taiDuLieuBanDau = async () => {
    try {
      setDangXuLy(true);
      const [resCat, resMon, resBan] = await Promise.all([
        axiosApi.get('/dishes/categories'),
        axiosApi.get('/dishes'),
        axiosApi.get('/tables')
      ]);

      if (resCat.success) setDanhMuc(resCat.categories);
      if (resMon.success) setDanhSachMon(resMon.dishes);
      if (resBan.success) {
        setDanhSachBan(resBan.tables);
        if (!banHienTai && resBan.tables.length > 0) {
          setBanHienTai(resBan.tables[0]);
        }
      }
    } catch (loi) {
      console.error('Lỗi khi tải dữ liệu POS:', loi);
    } finally {
      setDangXuLy(false);
    }
  };

  /**
   * Tải danh sách món ăn chưa thanh toán của bàn được chọn
   * @param {string|number} banId - ID bàn ăn
   */
  const taiMonCuaBan = async (banId) => {
    if (!banId) return;
    try {
      const res = await axiosApi.get(`/orders?ban_id=${banId}&unpaid_only=true`);
      if (res.success) {
        setMonDangPhucVu(res.orders);
      }
    } catch (loi) {
      console.error('Lỗi tải đơn bàn:', loi);
    }
  };

  useEffect(() => {
    taiDuLieuBanDau();
  }, []);

  useEffect(() => {
    if (banHienTai) {
      taiMonCuaBan(banHienTai.id);
    }
  }, [banHienTai]);

  /**
   * Thêm một món vào giỏ hàng hoặc tăng số lượng nếu đã có
   * @param {Object} mon - Đối tượng món ăn
   */
  const themVaoGio = (mon) => {
    setGioHang((prev) => {
      const daCo = prev.find((item) => item.mon_an_id === mon.id);
      if (daCo) {
        return prev.map((item) =>
          item.mon_an_id === mon.id
            ? { ...item, so_luong: item.so_luong + 1 }
            : item
        );
      }
      return [...prev, { mon_an_id: mon.id, dish: mon, so_luong: 1, ghi_chu: '', options: {} }];
    });
  };

  /**
   * Cập nhật số lượng của món ăn trong giỏ hàng
   * @param {string|number} monAnId - ID món ăn
   * @param {number} thayDoi - Giá trị tăng/giảm (+1 hoặc -1)
   */
  const capNhatSoLuong = (monAnId, thayDoi) => {
    setGioHang((prev) =>
      prev
        .map((item) => {
          if (item.mon_an_id === monAnId) {
            const soLuongMoi = item.so_luong + thayDoi;
            return soLuongMoi > 0 ? { ...item, so_luong: soLuongMoi } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  /**
   * Cập nhật ghi chú chế biến cho món ăn
   * @param {string|number} monAnId - ID món ăn
   * @param {string} ghiChu - Nội dung ghi chú (ví dụ: không cay, ít đá...)
   */
  const capNhatGhiChu = (monAnId, ghiChu) => {
    setGioHang((prev) =>
      prev.map((item) => (item.mon_an_id === monAnId ? { ...item, ghi_chu: ghiChu } : item))
    );
  };

  /**
   * Gửi đơn gọi món vào bếp (KDS) qua API và kích hoạt Socket realtime
   */
  const guiDonVaoBep = async () => {
    if (!banHienTai || gioHang.length === 0) return;
    try {
      setDangXuLy(true);
      const res = await axiosApi.post('/orders', {
        ban_id: banHienTai.id,
        items: gioHang.map((c) => ({
          mon_an_id: c.mon_an_id,
          so_luong: c.so_luong,
          ghi_chu: c.ghi_chu,
          options: c.options
        }))
      });

      if (res.success) {
        setGioHang([]);
        setThanhCong(true);
        taiMonCuaBan(banHienTai.id);
        taiDuLieuBanDau();
        setTimeout(() => setThanhCong(false), 2500);
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi gửi món vào bếp');
    } finally {
      setDangXuLy(false);
    }
  };

  // Lọc danh sách món ăn theo danh mục và từ khóa tìm kiếm
  const danhSachMonHienThi = danhSachMon.filter((mon) => {
    const hopDanhMuc = danhMucChon === 'all' || mon.loai_mon_id === Number(danhMucChon);
    const hopTimKiem =
      mon.ten_mon.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
      (mon.mo_ta && mon.mo_ta.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()));
    return hopDanhMuc && hopTimKiem;
  });

  // Tính tổng tiền giỏ hàng mới và tổng tiền các món đang phục vụ
  const tongTienGioHang = gioHang.reduce((tong, item) => tong + item.dish.gia * item.so_luong, 0);
  const tongTienDangPhucVu = monDangPhucVu.reduce((tong, item) => tong + (item.tong_tien || 0), 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      {/* KHU VỰC TRÁI VÀ GIỮA: CHỌN THỰC ĐƠN MÓN ĂN */}
      <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-100/50 p-5 overflow-hidden">
        {/* Thanh công cụ tìm kiếm và chọn nhanh bàn */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                placeholder="Tìm món theo tên, nguyên liệu, hương vị..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Chọn bàn ăn nhanh */}
            <select
              value={banHienTai?.id || ''}
              onChange={(e) => {
                const timThay = danhSachBan.find((t) => String(t.id) === String(e.target.value) || t.id === Number(e.target.value));
                setBanHienTai(timThay || null);
              }}
              className="bg-white border border-amber-300 text-amber-900 font-extrabold text-sm px-4 py-2.5 rounded-xl focus:outline-none shadow-2xs cursor-pointer"
            >
              {danhSachBan.map((t) => (
                <option key={t.id} value={t.id}>
                  Bàn {t.so_ban} ({t.khu_vuc}) - {t.trang_thai === 'co_khach' ? '🟢 Đang dùng' : '⚪ Trống'}
                </option>
              ))}
            </select>
          </div>

          {/* Nút lọc Danh mục món ăn */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setDanhMucChon('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                danhMucChon === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
              }`}
            >
              Tất Cả Món ({danhSachMon.length})
            </button>
            {danhMuc.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDanhMucChon(cat.id.toString())}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  danhMucChon === cat.id.toString()
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
                }`}
              >
                {cat.ten_loai}
              </button>
            ))}
          </div>
        </div>

        {/* Lưới danh sách món ăn */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {danhSachMonHienThi.map((mon) => (
              <div
                key={mon.id}
                onClick={() => themVaoGio(mon)}
                className="group relative bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative h-32 overflow-hidden bg-slate-100">
                  <img
                    src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                    alt={mon.ten_mon}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-amber-700 border border-amber-200 shadow-2xs">
                    {mon.ten_loai}
                  </span>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {mon.ten_mon}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {mon.mo_ta || 'Món ăn đặc sản tươi ngon chuẩn vị nhà hàng'}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-black text-amber-600">
                      {dinhDangTienTe(mon.gia)}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-500 text-amber-700 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
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

      {/* KHU VỰC PHẢI: GIỎ HÀNG VÀ MÓN ĐANG PHỤC VỤ CỦA BÀN */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-lg">
        {/* Thông tin bàn ăn ở đầu */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              {banHienTai?.so_ban || '?'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Bàn {banHienTai?.so_ban} • {banHienTai?.khu_vuc}
              </div>
              <div className="text-xs text-slate-500">
                Sức chứa: {banHienTai?.suc_chua} người
              </div>
            </div>
          </div>

          {monDangPhucVu.length > 0 && (
            <button
              onClick={() => setHienModalHoaDon(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Thanh Toán
            </button>
          )}
        </div>

        {/* Thông báo gửi bếp thành công */}
        {thanhCong && (
          <div className="m-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã gửi món vào Bếp thành công!</span>
          </div>
        )}

        {/* Danh sách giỏ hàng & món đã gọi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Phần 1: Giỏ hàng món mới chuẩn bị gửi */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-2 flex items-center justify-between">
              <span>🛒 Món Mới Chuẩn Bị Gửi ({gioHang.length})</span>
              {gioHang.length > 0 && (
                <button
                  onClick={() => setGioHang([])}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {gioHang.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                Chạm vào món ăn ở bên trái để thêm vào bàn
              </div>
            ) : (
              <div className="space-y-2">
                {gioHang.map((item) => (
                  <div
                    key={item.mon_an_id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.dish.ten_mon}</span>
                      <span className="font-black text-amber-600">
                        {dinhDangTienTe(item.dish.gia * item.so_luong)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Điều khiển số lượng */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => capNhatSoLuong(item.mon_an_id, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-slate-900">
                          {item.so_luong}
                        </span>
                        <button
                          onClick={() => capNhatSoLuong(item.mon_an_id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Ô nhập ghi chú */}
                      <input
                        type="text"
                        value={item.ghi_chu}
                        onChange={(e) => capNhatGhiChu(item.mon_an_id, e.target.value)}
                        placeholder="Ghi chú (ít cay, không hành...)"
                        className="flex-1 bg-white border border-slate-200 text-[11px] rounded-lg px-2 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 2: Các món đang phục vụ tại bàn */}
          {monDangPhucVu.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>📋 Món Đang Phục Vụ ({monDangPhucVu.length})</span>
                <span className="text-emerald-700 font-black">
                  {dinhDangTienTe(tongTienDangPhucVu)}
                </span>
              </div>

              <div className="space-y-1.5">
                {monDangPhucVu.map((don) => (
                  <div
                    key={don.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-slate-900 font-bold">{don.ten_mon}</span>
                      <span className="text-slate-500 ml-1.5 font-semibold">x{don.so_luong}</span>
                      {don.ghi_chu && <div className="text-[10px] text-amber-700 font-semibold">*{don.ghi_chu}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-slate-800 font-extrabold">
                        {dinhDangTienTe(don.tong_tien)}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        don.trang_thai === 'cho_xac_nhan' ? 'bg-amber-100 text-amber-800' :
                        don.trang_thai === 'dang_che_bien' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {don.trang_thai === 'cho_xac_nhan' ? 'Chờ bếp' :
                         don.trang_thai === 'dang_che_bien' ? 'Đang nấu' : 'Đã phục vụ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nút gửi đơn vào bếp */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-slate-500">Tổng Món Mới:</span>
            <span className="text-lg font-black text-amber-600">
              {dinhDangTienTe(tongTienGioHang)}
            </span>
          </div>

          <button
            disabled={gioHang.length === 0 || dangXuLy}
            onClick={guiDonVaoBep}
            className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              gioHang.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Gửi Vào Bếp (Realtime KDS)</span>
          </button>
        </div>
      </div>

      {/* Modal Thanh toán & In Hóa đơn */}
      {hienModalHoaDon && banHienTai && (
        <ModalInHoaDon
          table={banHienTai}
          orders={monDangPhucVu}
          onClose={() => setHienModalHoaDon(false)}
          onSuccess={() => {
            taiMonCuaBan(banHienTai.id);
            taiDuLieuBanDau();
          }}
        />
      )}
    </div>
  );
}
