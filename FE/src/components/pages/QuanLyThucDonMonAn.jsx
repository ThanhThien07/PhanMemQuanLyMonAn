/**
 * @file QuanLyThucDonMonAn.jsx
 * @description Màn hình Quản Lý Thực Đơn Món Ăn của nhà hàng Royal Bistro.
 * Cho phép xem danh sách món ăn, tìm kiếm theo tên/loại món, thêm món ăn mới với giá bán và danh mục, xóa món khỏi thực đơn.
 * @module pages/QuanLyThucDonMonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { Plus, Trash2, Search } from 'lucide-react';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';

/**
 * Component Quản lý Thực đơn Món ăn
 */
export default function QuanLyThucDonMonAn() {
  // Danh sách các món ăn
  const [danhSachMon, setDanhSachMon] = useState([]);
  // Danh mục loại món ăn
  const [danhMuc, setDanhMuc] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [dangTai, setDangTai] = useState(true);
  // Trạng thái hiển thị modal thêm món mới
  const [hienModal, setHienModal] = useState(false);
  // Từ khóa tìm kiếm món ăn
  const [tuKhoa, setTuKhoa] = useState('');
  // Biểu mẫu nhập thông tin món ăn mới
  const [duLieuForm, setDuLieuForm] = useState({
    ten_mon: '',
    loai_mon_id: 1,
    gia: '',
    mo_ta: '',
    hinh_anh: '',
    trang_thai: 'con_hang'
  });

  /**
   * Tải toàn bộ danh sách món ăn và danh mục từ máy chủ
   */
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      const [dRes, cRes] = await Promise.all([
        axiosApi.get('/dishes'),
        axiosApi.get('/dishes/categories')
      ]);
      if (dRes.success) setDanhSachMon(dRes.dishes);
      if (cRes.success) setDanhMuc(cRes.categories);
    } catch (loi) {
      console.error('Lỗi khi tải thực đơn:', loi);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  /**
   * Xử lý thêm món ăn mới vào hệ thống
   * @param {Event} e - Sự kiện submit biểu mẫu
   */
  const xuLyThemMon = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosApi.post('/dishes', {
        ...duLieuForm,
        gia: Number(duLieuForm.gia)
      });
      if (res.success) {
        setHienModal(false);
        setDuLieuForm({
          ten_mon: '',
          loai_mon_id: 1,
          gia: '',
          mo_ta: '',
          hinh_anh: '',
          trang_thai: 'con_hang'
        });
        taiDuLieu();
      }
    } catch (loi) {
      alert(loi.message || 'Lỗi khi thêm món ăn');
    }
  };

  /**
   * Xử lý xóa món ăn khỏi thực đơn
   * @param {string|number} id - ID món ăn cần xóa
   */
  const xuLyXoaMon = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?')) return;
    try {
      const res = await axiosApi.delete(`/dishes/${id}`);
      if (res.success) taiDuLieu();
    } catch (loi) {
      alert(loi.message || 'Lỗi khi xóa món');
    }
  };

  // Lọc món ăn theo từ khóa tìm kiếm
  const monLocTheoTimKiem = danhSachMon.filter(d => 
    d.ten_mon.toLowerCase().includes(tuKhoa.toLowerCase()) || 
    (d.ten_loai && d.ten_loai.toLowerCase().includes(tuKhoa.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Tiêu đề trang & Thanh công cụ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quản Lý Thực Đơn Nhà Hàng</h2>
          <p className="text-slate-500 text-sm font-medium">Danh mục món ăn, hình ảnh, giá bán và cấu hình trạng thái</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm tên món..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>
          <button
            onClick={() => setHienModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* Lưới danh sách món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {monLocTheoTimKiem.map((mon) => (
          <div
            key={mon.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all shadow-xs"
          >
            <div className="relative h-40 bg-slate-100">
              <img
                src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                alt={mon.ten_mon}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-amber-700 border border-amber-200 shadow-2xs">
                {mon.ten_loai}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 line-clamp-1">{mon.ten_mon}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{mon.mo_ta || 'Đặc sản thơm ngon tuyệt hảo'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-black text-amber-600">
                  {dinhDangTienTe(mon.gia)}
                </span>
                <button
                  onClick={() => xuLyXoaMon(mon.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Xóa món"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Món Ăn Mới */}
      {hienModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Thêm Món Ăn Mới</h3>

            <form onSubmit={xuLyThemMon} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Tên Món Ăn</label>
                <input
                  type="text"
                  required
                  value={duLieuForm.ten_mon}
                  onChange={(e) => setDuLieuForm({ ...duLieuForm, ten_mon: e.target.value })}
                  placeholder="Ví dụ: Bò Wagyu Nướng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Danh Mục</label>
                  <select
                    value={duLieuForm.loai_mon_id}
                    onChange={(e) => setDuLieuForm({ ...duLieuForm, loai_mon_id: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {danhMuc.map((c) => (
                      <option key={c.id} value={c.id}>{c.ten_loai}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Giá Bán (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={duLieuForm.gia}
                    onChange={(e) => setDuLieuForm({ ...duLieuForm, gia: e.target.value })}
                    placeholder="250000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">URL Hình Ảnh</label>
                <input
                  type="url"
                  value={duLieuForm.hinh_anh}
                  onChange={(e) => setDuLieuForm({ ...duLieuForm, hinh_anh: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Mô Tả Hương Vị & Thành Phần</label>
                <textarea
                  rows="2"
                  value={duLieuForm.mo_ta}
                  onChange={(e) => setDuLieuForm({ ...duLieuForm, mo_ta: e.target.value })}
                  placeholder="Thịt mềm, sốt tiêu đen cay nồng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setHienModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer"
                >
                  Lưu Món Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
