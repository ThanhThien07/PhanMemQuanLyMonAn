import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertTriangle, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [loading, setLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [addAmount, setAddAmount] = useState(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, supRes] = await Promise.all([
        api.get('/inventory/ingredients'),
        api.get('/inventory/suppliers')
      ]);
      if (ingRes.success) setIngredients(ingRes.ingredients);
      if (supRes.success) setSuppliers(supRes.suppliers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    try {
      const res = await api.patch(`/inventory/ingredients/${selectedIngredient.id}/stock`, {
        amount: addAmount,
        action: 'add'
      });
      if (res.success) {
        setSelectedIngredient(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const lowStockItems = ingredients.filter((i) => i.is_low_stock || i.so_luong_ton <= i.dinh_muc_toi_thieu);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quản Lý Kho & Nhà Cung Cấp</h2>
          <p className="text-slate-500 text-sm font-medium">
            Tự động trừ kho theo Định Lượng Món Ăn (BOM) & Cảnh báo nguyên liệu sắp cạn
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ingredients'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
            }`}
          >
            Kho Nguyên Liệu ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 shadow-2xs'
            }`}
          >
            Nhà Cung Cấp ({suppliers.length})
          </button>
        </div>
      </div>

      {/* Alert Banner if Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-rose-900">
                Có {lowStockItems.length} nguyên liệu chạm hoặc dưới định mức tồn kho tối thiểu!
              </div>
              <div className="text-xs text-rose-700/90 font-medium">
                {lowStockItems.map((i) => `${i.ten_nguyen_lieu} (còn ${i.so_luong_ton} ${i.don_vi_tinh})`).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      {activeTab === 'ingredients' ? (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Tên Nguyên Liệu</th>
                <th className="p-4">Số Lượng Tồn</th>
                <th className="p-4">Đơn Vị</th>
                <th className="p-4">Định Mức Tối Thiểu</th>
                <th className="p-4">Giá Nhập TB</th>
                <th className="p-4">Trạng Thái Kho</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {ingredients.map((ing) => {
                const isLow = ing.is_low_stock || ing.so_luong_ton <= ing.dinh_muc_toi_thieu;
                return (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{ing.ten_nguyen_lieu}</td>
                    <td className="p-4 font-mono font-black text-base text-amber-700">
                      {ing.so_luong_ton}
                    </td>
                    <td className="p-4 text-slate-500 uppercase text-xs font-bold">{ing.don_vi_tinh}</td>
                    <td className="p-4 text-slate-600">{ing.dinh_muc_toi_thieu} {ing.don_vi_tinh}</td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-700">
                      {formatCurrency(ing.gia_nhap_trung_binh)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        isLow
                          ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        {isLow ? '⚠️ Sắp hết hàng' : '✅ Đầy đủ'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedIngredient(ing)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-500 hover:text-slate-950 border border-amber-300 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Nhập Thêm
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Suppliers Table */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Mã NCC</th>
                <th className="p-4">Tên Nhà Cung Cấp</th>
                <th className="p-4">Số Điện Thoại</th>
                <th className="p-4">Email</th>
                <th className="p-4">Địa Chỉ</th>
                <th className="p-4">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-amber-700">{sup.ma_ncc}</td>
                  <td className="p-4 font-bold text-slate-900">{sup.ten_ncc}</td>
                  <td className="p-4 text-slate-600">{sup.so_dien_thoai}</td>
                  <td className="p-4 text-slate-600">{sup.email}</td>
                  <td className="p-4 text-slate-500 text-xs">{sup.dia_chi}</td>
                  <td className="p-4 text-amber-600 font-black">★ {sup.danh_gia_sao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Add Stock Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Nhập Thêm: {selectedIngredient.ten_nguyen_lieu}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Hiện tại trong kho còn: {selectedIngredient.so_luong_ton} {selectedIngredient.don_vi_tinh}
            </p>

            <form onSubmit={handleUpdateStock} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Số Lượng Nhập ({selectedIngredient.don_vi_tinh})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-base font-mono font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
                >
                  Xác Nhận Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
