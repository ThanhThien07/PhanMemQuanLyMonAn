import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Crown, Plus, Search } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ho_ten: '', so_dien_thoai: '', email: '' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', formData);
      if (res.success) {
        setShowModal(false);
        setFormData({ ho_ten: '', so_dien_thoai: '', email: '' });
        fetchCustomers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'KimCuong':
        return { label: 'Kim Cương', color: 'bg-cyan-50 text-cyan-800 border-cyan-300' };
      case 'Vang':
        return { label: 'Vàng', color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'Bac':
        return { label: 'Bạc', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: 'Đồng', color: 'bg-orange-50 text-orange-900 border-orange-300' };
    }
  };

  const filtered = customers.filter(c =>
    c.ho_ten.toLowerCase().includes(search.toLowerCase()) || c.so_dien_thoai.includes(search)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Khách Hàng Thân Thiết (CRM)</h2>
          <p className="text-slate-500 text-sm font-medium">Quản lý điểm tích lũy, hạng VIP và lịch sử chi tiêu</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm Khách Hàng
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Họ Tên</th>
              <th className="p-4">Số Điện Thoại</th>
              <th className="p-4">Email</th>
              <th className="p-4">Điểm Tích Lũy</th>
              <th className="p-4">Hạng Thành Viên</th>
              <th className="p-4">Tổng Chi Tiêu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map((c) => {
              const tierInfo = getTierBadge(c.hang_thanh_vien);
              return (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-800 text-xs shadow-2xs">
                      {c.ho_ten.charAt(0)}
                    </div>
                    {c.ho_ten}
                  </td>
                  <td className="p-4 font-mono font-semibold">{c.so_dien_thoai}</td>
                  <td className="p-4 text-slate-500">{c.email || '—'}</td>
                  <td className="p-4 font-mono font-black text-amber-700">
                    {c.diem_tich_luy} pts
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border inline-flex items-center gap-1 ${tierInfo.color}`}>
                      <Crown className="w-3 h-3" />
                      {tierInfo.label}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-black text-emerald-700">
                    {formatCurrency(c.tong_chi_tieu || 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Add Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Thêm Khách Hàng Thân Thiết</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.ho_ten}
                  onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  required
                  value={formData.so_dien_thoai}
                  onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                  placeholder="0912345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Email (Không bắt buộc)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="khachhang@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
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
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
