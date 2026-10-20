/**
 * @file QuanLyThucDonMonAn.jsx
 * @description Màn hình Quản Lý Thực Đơn Món Ăn của nhà hàng Royal Bistro.
 * Tính năng chính:
 * 1. Xem danh sách toàn bộ món ăn theo lưới card trực quan, có ảnh, giá bán, danh mục, trạng thái phục vụ.
 * 2. Lọc nhanh theo nhóm danh mục (Tất cả, Khai vị, Món chính, Đồ uống, Tráng miệng...).
 * 3. Tìm kiếm theo tên món hoặc mô tả theo thời gian thực.
 * 4. Thêm món ăn mới kèm danh mục, giá tiền, hình ảnh và mô tả.
 * 5. CHỈNH SỬA TỪNG MÓN ĂN: Cập nhật tên món, danh mục, đơn giá, trạng thái (Còn hàng / Tạm hết hàng / Tạm ngưng), ảnh minh họa và mô tả.
 * 6. Xóa món ăn khỏi thực đơn an toàn kèm cảnh báo xác nhận.
 * 7. Tích hợp Toast notification thông báo kết quả tức thì.
 * @module pages/QuanLyThucDonMonAn
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useEffect, useState } from 'react';
import axiosApi from '../services/cauHinhAxiosApi';
import { dinhDangTienTe } from '../utils/dinhDangDuLieu';
import { useToast } from '../context/ThongBaoToastContext';

export default function QuanLyThucDonMonAn() {
  const toast = useToast();

  // Danh sách các món ăn & danh mục
  const [danhSachMon, setDanhSachMon] = useState([]);
  const [danhMuc, setDanhMuc] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // Bộ lọc danh mục & Từ khóa tìm kiếm
  const [loaiMonDangChon, setLoaiMonDangChon] = useState('all');
  const [tuKhoa, setTuKhoa] = useState('');

  // Modal Thêm Món Mới
  const [hienModalThem, setHienModalThem] = useState(false);
  const [duLieuFormThem, setDuLieuFormThem] = useState({
    ten_mon: '',
    loai_mon_id: 1,
    gia: '',
    mo_ta: '',
    hinh_anh: '',
    trang_thai: 'con_hang'
  });

  // Modal Chỉnh Sửa Món Ăn
  const [monDangSua, setMonDangSua] = useState(null);
  const [duLieuFormSua, setDuLieuFormSua] = useState({
    id: '',
    ten_mon: '',
    loai_mon_id: 1,
    gia: '',
    mo_ta: '',
    hinh_anh: '',
    trang_thai: 'con_hang'
  });

  // Trạng thái đang lưu dữ liệu
  const [dangLuu, setDangLuu] = useState(false);

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
      if (dRes.success) setDanhSachMon(dRes.dishes || []);
      if (cRes.success) setDanhMuc(cRes.categories || []);
    } catch (loi) {
      console.error('Lỗi khi tải thực đơn:', loi);
      toast.loi(loi.message || 'Không thể tải danh sách thực đơn.', 'Lỗi Dữ Liệu');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  /**
   * Mở modal chỉnh sửa cho món ăn cụ thể
   * @param {Object} mon - Dữ liệu món ăn được chọn
   */
  const moModalSua = (mon) => {
    setMonDangSua(mon);
    setDuLieuFormSua({
      id: mon.id,
      ten_mon: mon.ten_mon || '',
      loai_mon_id: mon.loai_mon_id || (danhMuc[0]?.id || 1),
      gia: mon.gia || '',
      mo_ta: mon.mo_ta || '',
      hinh_anh: mon.hinh_anh || '',
      trang_thai: mon.trang_thai || 'con_hang'
    });
  };

  /**
   * Xử lý gửi biểu mẫu Thêm Món Mới
   */
  const xuLyThemMon = async (e) => {
    e.preventDefault();
    if (!duLieuFormThem.ten_mon.trim()) {
      toast.canhBao('Vui lòng nhập tên món ăn.', 'Thiếu Thông Tin');
      return;
    }
    if (duLieuFormThem.gia === '' || Number(duLieuFormThem.gia) < 0) {
      toast.canhBao('Đơn giá phải là số hợp lệ từ 0 trở lên.', 'Đơn Giá');
      return;
    }

    setDangLuu(true);
    try {
      const res = await axiosApi.post('/dishes', {
        ...duLieuFormThem,
        ten_mon: duLieuFormThem.ten_mon.trim(),
        loai_mon_id: Number(duLieuFormThem.loai_mon_id),
        gia: Number(duLieuFormThem.gia),
        mo_ta: duLieuFormThem.mo_ta.trim(),
        hinh_anh: duLieuFormThem.hinh_anh.trim()
      });
      if (res.success) {
        toast.thanhCong(`🎉 Đã thêm món "${duLieuFormThem.ten_mon}" vào thực đơn!`, 'Thực Đơn');
        setHienModalThem(false);
        setDuLieuFormThem({
          ten_mon: '',
          loai_mon_id: danhMuc[0]?.id || 1,
          gia: '',
          mo_ta: '',
          hinh_anh: '',
          trang_thai: 'con_hang'
        });
        taiDuLieu();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi thêm món ăn mới.', 'Thêm Thất Bại');
    } finally {
      setDangLuu(false);
    }
  };

  /**
   * Xử lý gửi biểu mẫu Cập Nhật Chỉnh Sửa Món Ăn
   */
  const xuLyCapNhatMon = async (e) => {
    e.preventDefault();
    if (!duLieuFormSua.ten_mon.trim()) {
      toast.canhBao('Tên món ăn không được để trống.', 'Thiếu Thông Tin');
      return;
    }
    if (duLieuFormSua.gia === '' || Number(duLieuFormSua.gia) < 0) {
      toast.canhBao('Đơn giá phải là số hợp lệ từ 0 trở lên.', 'Đơn Giá');
      return;
    }

    setDangLuu(true);
    try {
      const res = await axiosApi.put(`/dishes/${duLieuFormSua.id}`, {
        ten_mon: duLieuFormSua.ten_mon.trim(),
        loai_mon_id: Number(duLieuFormSua.loai_mon_id),
        gia: Number(duLieuFormSua.gia),
        mo_ta: duLieuFormSua.mo_ta.trim(),
        hinh_anh: duLieuFormSua.hinh_anh.trim(),
        trang_thai: duLieuFormSua.trang_thai
      });
      if (res.success) {
        toast.thanhCong(`✨ Đã cập nhật thành công món "${duLieuFormSua.ten_mon}"!`, 'Cập Nhật Thực Đơn');
        setMonDangSua(null);
        taiDuLieu();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi cập nhật thông tin món ăn.', 'Cập Nhật Thất Bại');
    } finally {
      setDangLuu(false);
    }
  };

  /**
   * Xử lý xóa món ăn khỏi thực đơn
   * @param {string|number} id - ID món ăn cần xóa
   * @param {string} tenMon - Tên món ăn để hiển thị xác nhận
   */
  const xuLyXoaMon = async (id, tenMon = 'món ăn') => {
    if (!confirm(`Bạn có chắc chắn muốn xóa món "${tenMon}" khỏi thực đơn không?`)) return;
    try {
      const res = await axiosApi.delete(`/dishes/${id}`);
      if (res.success) {
        toast.thanhCong(`Đã xóa món "${tenMon}" khỏi thực đơn thành công!`, 'Xóa Món');
        taiDuLieu();
      }
    } catch (loi) {
      toast.loi(loi.message || 'Lỗi khi xóa món ăn.', 'Lỗi Xóa Món');
    }
  };

  // Lọc danh sách món ăn theo danh mục và từ khóa tìm kiếm
  const monLocTheoBoLoc = danhSachMon.filter((d) => {
    const khopDanhMuc = loaiMonDangChon === 'all' || d.loai_mon_id === Number(loaiMonDangChon);
    const khopTuKhoa =
      !tuKhoa.trim() ||
      d.ten_mon?.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      d.ten_loai?.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      d.mo_ta?.toLowerCase().includes(tuKhoa.toLowerCase());
    return khopDanhMuc && khopTuKhoa;
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-3 max-w-7xl mx-auto space-y-4">
      {/* Tiêu đề trang & Thanh công cụ */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 text-xs fw-bold">
              <i className="bi bi-book me-1"></i>Thực Đơn
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {danhSachMon.length} món trong hệ thống
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
            Quản Lý Thực Đơn Nhà Hàng
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-0">
            Cập nhật món ăn, sửa giá bán, danh mục, hình ảnh và trạng thái phục vụ
          </p>
        </div>

        <div className="d-flex align-items-center gap-2.5 flex-wrap flex-sm-nowrap">
          <div className="input-group input-group-sm" style={{ minWidth: '220px' }}>
            <span className="input-group-text bg-white border-slate-200 text-slate-400">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên món, mô tả..."
              className="form-control bg-white border-slate-200 text-xs"
            />
            {tuKhoa && (
              <button
                className="btn btn-outline-secondary border-slate-200 text-xs px-2"
                onClick={() => setTuKhoa('')}
                title="Xóa tìm kiếm"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          <button
            onClick={() => setHienModalThem(true)}
            className="btn btn-warning text-white fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm shrink-0"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Thêm Món Mới</span>
          </button>
        </div>
      </div>

      {/* Thanh tab lọc theo nhóm danh mục */}
      <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 border-bottom border-slate-200">
        <button
          onClick={() => setLoaiMonDangChon('all')}
          className={`btn btn-sm rounded-pill px-3 py-1 text-xs font-bold transition-all shrink-0 ${
            loaiMonDangChon === 'all'
              ? 'btn-dark shadow-xs'
              : 'btn-light border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Tất cả ({danhSachMon.length})
        </button>
        {danhMuc.map((dm) => {
          const soLuongMon = danhSachMon.filter((m) => m.loai_mon_id === dm.id).length;
          return (
            <button
              key={dm.id}
              onClick={() => setLoaiMonDangChon(dm.id)}
              className={`btn btn-sm rounded-pill px-3 py-1 text-xs font-bold transition-all shrink-0 ${
                Number(loaiMonDangChon) === dm.id
                  ? 'btn-warning text-white shadow-xs'
                  : 'btn-light border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {dm.ten_loai} ({soLuongMon})
            </button>
          );
        })}
      </div>

      {/* Trạng thái đang tải dữ liệu */}
      {dangTai && (
        <div className="text-center py-12">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-xs text-slate-500 font-semibold mt-2">Đang tải danh mục thực đơn...</p>
        </div>
      )}

      {/* Thông báo nếu không có món nào khớp bộ lọc */}
      {!dangTai && monLocTheoBoLoc.length === 0 && (
        <div className="text-center py-12 bg-white rounded-4 border border-dashed border-slate-300 p-5">
          <i className="bi bi-inbox fs-1 text-slate-400 d-block mb-2"></i>
          <h5 className="text-sm font-bold text-slate-700">Không tìm thấy món ăn nào</h5>
          <p className="text-xs text-slate-500 mb-3">
            Vui lòng thử từ khóa tìm kiếm khác hoặc chuyển sang danh mục món khác.
          </p>
          <button
            onClick={() => {
              setTuKhoa('');
              setLoaiMonDangChon('all');
            }}
            className="btn btn-sm btn-outline-warning text-xs font-bold px-3 py-1.5 rounded-3"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* Lưới danh sách món ăn */}
      {!dangTai && monLocTheoBoLoc.length > 0 && (
        <div className="row g-3 g-md-4">
          {monLocTheoBoLoc.map((mon) => {
            const laHetHang = mon.trang_thai === 'het_hang';
            const laTamNgung = mon.trang_thai === 'tam_ngung';

            return (
              <div key={mon.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div
                  className={`card h-100 bg-white border rounded-4 overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    laHetHang || laTamNgung ? 'border-rose-200 opacity-90' : 'border-slate-200'
                  }`}
                >
                  {/* Khung ảnh & huy hiệu trạng thái */}
                  <div className="position-relative" style={{ height: '175px' }}>
                    <img
                      src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={mon.ten_mon}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                      }}
                      className="w-100 h-100 object-cover"
                    />

                    {/* Danh mục (Top-left) */}
                    <span
                      className="position-absolute top-2 start-2 px-2.5 py-1 rounded-pill bg-white/95 border border-amber-200 shadow-xs fw-bold text-[11px]"
                      style={{ color: '#78350f' }}
                    >
                      <i className="bi bi-tag-fill me-1 text-amber-600"></i>
                      {mon.ten_loai || 'Món'}
                    </span>

                    {/* Trạng thái phục vụ (Top-right) */}
                    <span className="position-absolute top-2 end-2">
                      {mon.trang_thai === 'con_hang' && (
                        <span className="badge bg-emerald-500 text-white rounded-pill px-2.5 py-1 text-[11px] font-bold shadow-xs d-flex align-items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse"></span>
                          Còn Hàng
                        </span>
                      )}
                      {mon.trang_thai === 'het_hang' && (
                        <span className="badge bg-rose-600 text-white rounded-pill px-2.5 py-1 text-[11px] font-bold shadow-xs d-flex align-items-center gap-1">
                          <i className="bi bi-x-circle-fill"></i>
                          Hết Món
                        </span>
                      )}
                      {mon.trang_thai === 'tam_ngung' && (
                        <span className="badge bg-slate-600 text-white rounded-pill px-2.5 py-1 text-[11px] font-bold shadow-xs">
                          Tạm Ngưng
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Thân card thông tin */}
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <h4
                        className="card-title text-sm sm:text-base font-extrabold text-slate-900 mb-1 line-clamp-2 min-h-[42px]"
                        title={mon.ten_mon}
                      >
                        {mon.ten_mon}
                      </h4>
                      <p className="card-text text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">
                        {mon.mo_ta || 'Món ngon hảo hạng phục vụ tại bàn của nhà hàng Royal Bistro.'}
                      </p>
                    </div>

                    {/* Giá bán và Các nút hành động: Chỉnh Sửa & Xóa */}
                    <div className="pt-2.5 border-top border-slate-100 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          Giá niêm yết
                        </span>
                        <span className="text-sm sm:text-base font-black text-amber-600">
                          {dinhDangTienTe(mon.gia)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-1.5">
                        {/* Nút Chỉnh Sửa Món Ăn */}
                        <button
                          type="button"
                          onClick={() => moModalSua(mon)}
                          className="btn btn-sm btn-outline-primary rounded-3 px-2.5 py-1.5 d-flex align-items-center gap-1 text-xs fw-bold shadow-xs hover:shadow transition-all"
                          title="Chỉnh sửa thông tin món ăn này"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Sửa</span>
                        </button>

                        {/* Nút Xóa Món Ăn */}
                        <button
                          type="button"
                          onClick={() => xuLyXoaMon(mon.id, mon.ten_mon)}
                          className="btn btn-sm btn-outline-danger rounded-3 p-1.5 d-flex align-items-center justify-content-center shadow-xs hover:shadow transition-all"
                          title="Xóa món ăn khỏi thực đơn"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CHỈNH SỬA TỪNG MÓN ĂN (EDIT DISH MODAL)          */}
      {/* ========================================================= */}
      {monDangSua && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              {/* Header Modal */}
              <div className="modal-header bg-gradient-to-r from-blue-50 to-indigo-50 border-bottom border-slate-200 px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-8 h-8 rounded-3 bg-blue-600 text-white d-flex align-items-center justify-content-center shadow-xs">
                    <i className="bi bi-pencil-square fs-6"></i>
                  </div>
                  <div>
                    <h5 className="modal-title text-base font-black text-slate-900 mb-0">
                      Chỉnh Sửa Món Ăn
                    </h5>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Mã món: #{monDangSua.id} &bull; {monDangSua.ten_mon}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMonDangSua(null)}
                ></button>
              </div>

              {/* Body Modal */}
              <div className="modal-body p-4">
                <form onSubmit={xuLyCapNhatMon} className="space-y-3">
                  <div className="row g-3">
                    {/* Cột trái: Thông tin tên, danh mục, giá, trạng thái */}
                    <div className="col-12 col-md-7 space-y-3">
                      {/* Tên Món Ăn */}
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Tên Món Ăn <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={duLieuFormSua.ten_mon}
                          onChange={(e) =>
                            setDuLieuFormSua({ ...duLieuFormSua, ten_mon: e.target.value })
                          }
                          placeholder="Ví dụ: Bò Wagyu Nướng..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-semibold"
                        />
                      </div>

                      <div className="row g-2">
                        {/* Danh Mục */}
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                            Danh Mục <span className="text-danger">*</span>
                          </label>
                          <select
                            value={duLieuFormSua.loai_mon_id}
                            onChange={(e) =>
                              setDuLieuFormSua({
                                ...duLieuFormSua,
                                loai_mon_id: Number(e.target.value)
                              })
                            }
                            className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2 font-medium"
                          >
                            {danhMuc.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.ten_loai}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Giá Bán */}
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                            Giá Bán (VND) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            value={duLieuFormSua.gia}
                            onChange={(e) =>
                              setDuLieuFormSua({ ...duLieuFormSua, gia: e.target.value })
                            }
                            placeholder="250000"
                            className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold text-amber-600"
                          />
                        </div>
                      </div>

                      {/* Trạng Thái Phục Vụ */}
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Trạng Thái Phục Vụ <span className="text-danger">*</span>
                        </label>
                        <select
                          value={duLieuFormSua.trang_thai}
                          onChange={(e) =>
                            setDuLieuFormSua({ ...duLieuFormSua, trang_thai: e.target.value })
                          }
                          className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2 font-semibold"
                        >
                          <option value="con_hang">🟢 Còn Hàng (Sẵn sàng phục vụ khách)</option>
                          <option value="het_hang">🔴 Tạm Hết Hàng (Ngừng nhận đơn trên POS & Menu QR)</option>
                          <option value="tam_ngung">⚪ Tạm Ngưng Bán (Ẩn hoặc ngưng mùa)</option>
                        </select>
                      </div>

                      {/* URL Hình Ảnh */}
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Đường Dẫn URL Hình Ảnh
                        </label>
                        <input
                          type="url"
                          value={duLieuFormSua.hinh_anh}
                          onChange={(e) =>
                            setDuLieuFormSua({ ...duLieuFormSua, hinh_anh: e.target.value })
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                        />
                      </div>
                    </div>

                    {/* Cột phải: Xem trước hình ảnh & Mô tả */}
                    <div className="col-12 col-md-5 space-y-3">
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Xem Trước Hình Ảnh
                        </label>
                        <div
                          className="rounded-3 border border-slate-200 overflow-hidden bg-slate-100 position-relative shadow-inner"
                          style={{ height: '145px' }}
                        >
                          <img
                            src={
                              duLieuFormSua.hinh_anh ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                            }
                            alt="Xem trước món"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                            }}
                            className="w-100 h-100 object-cover"
                          />
                        </div>
                      </div>

                      {/* Mô Tả Hương Vị & Thành Phần */}
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Mô Tả Hương Vị & Thành Phần
                        </label>
                        <textarea
                          rows="4"
                          value={duLieuFormSua.mo_ta}
                          onChange={(e) =>
                            setDuLieuFormSua({ ...duLieuFormSua, mo_ta: e.target.value })
                          }
                          placeholder="Mô tả độ ngon, thành phần chính, khẩu vị cay/ngọt..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động Lưu / Hủy */}
                  <div className="pt-3 border-top border-slate-200 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMonDangSua(null)}
                      className="btn btn-light border px-4 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={dangLuu}
                      className="btn btn-primary px-4 py-2 rounded-3 fw-bold text-xs shadow-sm d-flex align-items-center gap-1.5"
                    >
                      {dangLuu ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle fs-6"></i>
                          <span>Lưu Thay Đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: THÊM MÓN ĂN MỚI                                  */}
      {/* ========================================================= */}
      {hienModalThem && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-50 border-bottom border-slate-200 px-4 py-3">
                <h5 className="modal-title text-base font-black text-slate-900 d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle-fill text-warning"></i>
                  <span>Thêm Món Ăn Mới Vào Thực Đơn</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setHienModalThem(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={xuLyThemMon} className="space-y-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-7 space-y-3">
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Tên Món Ăn <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={duLieuFormThem.ten_mon}
                          onChange={(e) =>
                            setDuLieuFormThem({ ...duLieuFormThem, ten_mon: e.target.value })
                          }
                          placeholder="Ví dụ: Bò Wagyu Nướng..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-semibold"
                        />
                      </div>

                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                            Danh Mục <span className="text-danger">*</span>
                          </label>
                          <select
                            value={duLieuFormThem.loai_mon_id}
                            onChange={(e) =>
                              setDuLieuFormThem({
                                ...duLieuFormThem,
                                loai_mon_id: Number(e.target.value)
                              })
                            }
                            className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2"
                          >
                            {danhMuc.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.ten_loai}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                            Giá Bán (VND) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            value={duLieuFormThem.gia}
                            onChange={(e) =>
                              setDuLieuFormThem({ ...duLieuFormThem, gia: e.target.value })
                            }
                            placeholder="250000"
                            className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold text-amber-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Trạng Thái Phục Vụ
                        </label>
                        <select
                          value={duLieuFormThem.trang_thai}
                          onChange={(e) =>
                            setDuLieuFormThem({ ...duLieuFormThem, trang_thai: e.target.value })
                          }
                          className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2"
                        >
                          <option value="con_hang">🟢 Còn Hàng (Phục vụ ngay)</option>
                          <option value="het_hang">🔴 Tạm Hết Hàng</option>
                          <option value="tam_ngung">⚪ Tạm Ngưng Bán</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Đường Dẫn URL Hình Ảnh
                        </label>
                        <input
                          type="url"
                          value={duLieuFormThem.hinh_anh}
                          onChange={(e) =>
                            setDuLieuFormThem({ ...duLieuFormThem, hinh_anh: e.target.value })
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-5 space-y-3">
                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Xem Trước Hình Ảnh
                        </label>
                        <div
                          className="rounded-3 border border-slate-200 overflow-hidden bg-slate-100 position-relative shadow-inner"
                          style={{ height: '145px' }}
                        >
                          <img
                            src={
                              duLieuFormThem.hinh_anh ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                            }
                            alt="Xem trước món"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                            }}
                            className="w-100 h-100 object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                          Mô Tả Hương Vị & Thành Phần
                        </label>
                        <textarea
                          rows="4"
                          value={duLieuFormThem.mo_ta}
                          onChange={(e) =>
                            setDuLieuFormThem({ ...duLieuFormThem, mo_ta: e.target.value })
                          }
                          placeholder="Mô tả hương vị đậm đà, thành phần chính..."
                          className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-top border-slate-200 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      onClick={() => setHienModalThem(false)}
                      className="btn btn-light border px-4 py-2 rounded-3 fw-bold text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={dangLuu}
                      className="btn btn-warning text-white px-4 py-2 rounded-3 fw-bold text-xs shadow-sm d-flex align-items-center gap-1.5"
                    >
                      {dangLuu ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-lg"></i>
                          <span>Lưu Món Mới</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
