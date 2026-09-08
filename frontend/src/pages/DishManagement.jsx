import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Search } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function DishManagement() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    ten_mon: '',
    loai_mon_id: 1,
    gia: '',
    mo_ta: '',
    hinh_anh: '',
    trang_thai: 'con_hang'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        api.get('/dishes'),
        api.get('/dishes/categories')
      ]);
      if (dRes.success) setDishes(dRes.dishes);
      if (cRes.success) setCategories(cRes.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dishes', {
        ...formData,
        gia: Number(formData.gia)
      });
      if (res.success) {
        setShowModal(false);
        setFormData({
          ten_mon: '',
          loai_mon_id: 1,
          gia: '',
          mo_ta: '',
          hinh_anh: '',
          trang_thai: 'con_hang'
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?')) return;
    try {
      const res = await api.delete(`/dishes/${id}`);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDishes = dishes.filter(d => 
    d.ten_mon.toLowerCase().includes(search.toLowerCase()) || 
    (d.ten_loai && d.ten_loai.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên món..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all shadow-xs"
          >
            <div className="relative h-40 bg-slate-100">
              <img
                src={dish.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                alt={dish.ten_mon}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-amber-700 border border-amber-200 shadow-2xs">
                {dish.ten_loai}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 line-clamp-1">{dish.ten_mon}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dish.mo_ta || 'Đặc sản thơm ngon tuyệt hảo'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-black text-amber-600">
                  {formatCurrency(dish.gia)}
                </span>
                <button
                  onClick={() => handleDelete(dish.id)}
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

      {/* Modal Add Dish */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Thêm Món Ăn Mới</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Tên Món Ăn</label>
                <input
                  type="text"
                  required
                  value={formData.ten_mon}
                  onChange={(e) => setFormData({ ...formData, ten_mon: e.target.value })}
                  placeholder="Ví dụ: Bò Wagyu Nướng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Danh Mục</label>
                  <select
                    value={formData.loai_mon_id}
                    onChange={(e) => setFormData({ ...formData, loai_mon_id: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
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
                    value={formData.gia}
                    onChange={(e) => setFormData({ ...formData, gia: e.target.value })}
                    placeholder="250000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">URL Hình Ảnh</label>
                <input
                  type="url"
                  value={formData.hinh_anh}
                  onChange={(e) => setFormData({ ...formData, hinh_anh: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Mô Tả Hương Vị & Thành Phần</label>
                <textarea
                  rows="2"
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  placeholder="Thịt mềm, sốt tiêu đen cay nồng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
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
