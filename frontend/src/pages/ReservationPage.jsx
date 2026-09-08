import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Phone, Users } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/format';

export default function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ten_khach: '',
    sdt: '',
    ban_id: '',
    thoi_gian_hen: '',
    so_luong_khach: 2,
    tien_coc: 0,
    ghi_chu: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resvRes, tableRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/tables')
      ]);
      if (resvRes.success) setReservations(resvRes.reservations);
      if (tableRes.success) setTables(tableRes.tables);
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
      const res = await api.post('/reservations', formData);
      if (res.success) {
        setShowModal(false);
        setFormData({
          ten_khach: '',
          sdt: '',
          ban_id: '',
          thoi_gian_hen: '',
          so_luong_khach: 2,
          tien_coc: 0,
          ghi_chu: ''
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckin = async (id) => {
    try {
      const res = await api.patch(`/reservations/${id}/checkin`);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đặt bàn này?')) return;
    try {
      const res = await api.patch(`/reservations/${id}/cancel`);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quản Lý Đặt Bàn Trước (Reservation)</h2>
          <p className="text-slate-500 text-sm font-medium">Tiếp nhận thông tin khách đặt chỗ, cọc tiền và đón khách</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Lịch Hẹn Mới
        </button>
      </div>

      {/* Reservations Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Mã Đặt</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Bàn & Khu Vực</th>
                <th className="p-4">Thời Gian Hẹn</th>
                <th className="p-4">Số Khách</th>
                <th className="p-4">Tiền Cọc</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-amber-700">{r.ma_reservation}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{r.ten_khach}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" /> {r.sdt}
                    </div>
                  </td>
                  <td className="p-4">
                    {r.so_ban ? (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold border border-slate-200 text-xs">
                        Bàn {r.so_ban} ({r.khu_vuc})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Chưa chỉ định</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600 font-semibold">
                    {formatDateTime(r.thoi_gian_hen)}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {r.so_luong_khach}
                    </span>
                  </td>
                  <td className="p-4 font-black text-emerald-700">
                    {formatCurrency(r.tien_coc)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      r.trang_thai === 'da_den' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      r.trang_thai === 'da_huy' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                      'bg-sky-50 text-sky-800 border-sky-300'
                    }`}>
                      {r.trang_thai === 'da_den' ? 'Đã đến' :
                       r.trang_thai === 'da_huy' ? 'Đã hủy' : 'Đã xác nhận'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {r.trang_thai === 'da_xac_nhan' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCheckin(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-300 font-bold text-xs transition-all shadow-2xs cursor-pointer"
                        >
                          Check-in
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-500 hover:text-white border border-rose-300 font-bold text-xs transition-all shadow-2xs cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Reservation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Thêm Lịch Đặt Bàn Mới</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Tên Khách Hàng</label>
                <input
                  type="text"
                  required
                  value={formData.ten_khach}
                  onChange={(e) => setFormData({ ...formData, ten_khach: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  required
                  value={formData.sdt}
                  onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                  placeholder="0901234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Chọn Bàn</label>
                  <select
                    value={formData.ban_id}
                    onChange={(e) => setFormData({ ...formData, ban_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Chưa chọn bàn</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>Bàn {t.so_ban} ({t.khu_vuc})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Số Lượng Khách</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.so_luong_khach}
                    onChange={(e) => setFormData({ ...formData, so_luong_khach: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Thời Gian Hẹn</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.thoi_gian_hen}
                  onChange={(e) => setFormData({ ...formData, thoi_gian_hen: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Tiền Cọc (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={formData.tien_coc}
                  onChange={(e) => setFormData({ ...formData, tien_coc: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Ghi Chú Yêu Cầu</label>
                <input
                  type="text"
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                  placeholder="Kỷ niệm ngày cưới, cần bàn view đẹp..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition-all"
                >
                  Lưu Đặt Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
