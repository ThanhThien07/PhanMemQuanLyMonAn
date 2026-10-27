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
 * @author Nguyễn Hoàng Hưng
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
    thoi_gian_nau: 15,
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
    thoi_gian_nau: 15,
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
      thoi_gian_nau: mon.thoi_gian_nau || 15,
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
        thoi_gian_nau: Number(duLieuFormThem.thoi_gian_nau) > 0 ? Number(duLieuFormThem.thoi_gian_nau) : 15,
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
          thoi_gian_nau: 15,
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
        thoi_gian_nau: Number(duLieuFormSua.thoi_gian_nau) > 0 ? Number(duLieuFormSua.thoi_gian_nau) : 15,
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
      {/* Tiêu đề trang & Thanh công cụ trong Card nổi khối */}
      <div className="card bg-white border-2 border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Hàng 1: Tiêu đề trang (Trái) & Nút Thêm Món Mới (Phải) - Luôn hiển thị to rõ, không bao giờ bị che khuất */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-red-600 text-white rounded-pill px-3 py-1 text-xs font-black shadow-2xs whitespace-nowrap text-nowrap">
                <i className="bi bi-book me-1"></i>Thực Đơn
              </span>
              <span className="text-xs text-slate-600 font-bold whitespace-nowrap text-nowrap">
                {danhSachMon.length} món trong hệ thống
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0 whitespace-nowrap text-nowrap">
              Quản Lý Thực Đơn Nhà Hàng
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setHienModalThem(true)}
            className="btn btn-primary text-white font-black px-4 py-2.5 rounded-pill inline-flex items-center justify-center gap-2 shadow-sm text-xs whitespace-nowrap cursor-pointer hover:shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <i className="bi bi-plus-lg shrink-0"></i>
            <span className="whitespace-nowrap">Thêm Món Mới</span>
          </button>
        </div>

        {/* Hàng 2: Bộ lọc danh mục (Trái) & Ô tìm kiếm món ăn (Phải) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Thanh tab lọc theo nhóm danh mục */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setLoaiMonDangChon('all')}
              className={`btn btn-sm rounded-pill px-3.5 py-1.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
                loaiMonDangChon === 'all'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border border-slate-200/90 text-slate-700 hover:text-blue-700'
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
                  className={`btn btn-sm rounded-pill px-3.5 py-1.5 text-xs font-black transition-all shrink-0 cursor-pointer ${
                    Number(loaiMonDangChon) === dm.id
                      ? 'btn-primary text-white shadow-xs'
                      : 'btn-light border border-slate-200/90 text-slate-700 hover:text-blue-700'
                  }`}
                >
                  {dm.ten_loai} ({soLuongMon})
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm món ăn */}
          <div className="input-group input-group-sm w-full lg:w-72 shrink-0">
            <span className="input-group-text bg-slate-50 border-slate-200 text-slate-500">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên món, mô tả..."
              className="form-control bg-slate-50 border-slate-200 text-xs"
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
        </div>
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
                  className={`card h-100 bg-white border-2 rounded-4 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500 transition-all hover:-translate-y-1 ${
                    laHetHang || laTamNgung ? 'border-rose-300 opacity-90' : 'border-slate-200/90'
                  }`}
                >
                  {/* Khung ảnh & huy hiệu trạng thái */}
                  <div className="position-relative" style={{ height: '175px' }}>
                    <img
                      src={mon.hinh_anh || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={mon.ten_mon}
                      width="400"
                      height="175"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                      }}
                      className="w-100 h-100 object-cover"
                    />

                    {/* Chỉ hiển thị Tag đỏ khi món ăn có chương trình GIẢM GIÁ */}
                    {Boolean(mon.phan_tram_giam || mon.is_discount) && (
                      <span className="position-absolute top-2.5 start-2.5 px-2.5 py-1 rounded-pill bg-red-600 text-white shadow-sm font-black text-xs d-flex align-items-center gap-1">
                        <i className="bi bi-tag-fill"></i>
                        Giảm {mon.phan_tram_giam || 15}%
                      </span>
                    )}

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
                      <p className="card-text text-xs text-slate-500 line-clamp-2 mb-2 min-h-[32px]">
                        {mon.mo_ta || 'Món ngon hảo hạng phục vụ tại bàn của nhà hàng Royal Bistro.'}
                      </p>

                      {/* Thời gian làm món dự kiến để khách biết trước */}
                      <div className="d-flex align-items-center gap-1.5 mb-2">
                        <span className="badge bg-slate-100 text-slate-700 border border-slate-200/90 rounded-pill px-2.5 py-1 text-[11px] font-bold d-inline-flex align-items-center gap-1 shadow-2xs">
                          <i className="bi bi-clock-history text-amber-600"></i>
                          <span>Làm trong ~{mon.thoi_gian_nau || 15} phút</span>
                        </span>
                      </div>
                    </div>

                    {/* Giá bán: Màu ĐỎ khi có giảm giá, màu ĐEN khi giá bình thường */}
                    <div className="pt-2.5 border-top border-slate-100 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {mon.phan_tram_giam || mon.is_discount ? 'Giá ưu đãi' : 'Giá niêm yết'}
                        </span>
                        <span className={`text-sm sm:text-base font-black ${
                          mon.phan_tram_giam || mon.is_discount ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {dinhDangTienTe(mon.gia)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-1.5">
                        {/* Nút Chỉnh Sửa Món Ăn */}
                        <button
                          type="button"
                          onClick={() => moModalSua(mon)}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1 text-xs fw-bold shadow-xs hover:shadow transition-all"
                          title="Chỉnh sửa thông tin món ăn này"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Sửa</span>
                        </button>

                        {/* Nút Xóa Món Ăn */}
                        <button
                          type="button"
                          onClick={() => xuLyXoaMon(mon.id, mon.ten_mon)}
                          className="btn btn-sm btn-outline-danger rounded-pill p-1.5 d-flex align-items-center justify-content-center shadow-xs hover:shadow transition-all"
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
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
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

                      {/* Hàng Thời Gian Làm Món & Trạng Thái Phục Vụ */}
                      <div className="row g-2">
                        {/* Thời Gian Chế Biến / Làm Món */}
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1 d-flex align-items-center gap-1">
                            <i className="bi bi-clock-history text-amber-600"></i>
                            <span>Thời Gian Làm (Phút)</span>
                          </label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              min="1"
                              max="180"
                              required
                              value={duLieuFormSua.thoi_gian_nau}
                              onChange={(e) =>
                                setDuLieuFormSua({ ...duLieuFormSua, thoi_gian_nau: e.target.value })
                              }
                              placeholder="15"
                              className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold text-slate-900"
                            />
                            <span className="input-group-text bg-slate-100 border-slate-200 text-xs text-slate-600 font-bold">
                              phút
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">Khách sẽ biết món làm bao lâu</span>
                        </div>

                        {/* Trạng Thái Phục Vụ */}
                        <div className="col-6">
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
                            <option value="con_hang">🟢 Còn Hàng (Phục vụ ngay)</option>
                            <option value="het_hang">🔴 Tạm Hết Hàng (Ngừng nhận đơn)</option>
                            <option value="tam_ngung">⚪ Tạm Ngưng Bán</option>
                          </select>
                        </div>
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
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
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

                      {/* Hàng Thời Gian Làm Món & Trạng Thái Phục Vụ */}
                      <div className="row g-2">
                        {/* Thời Gian Chế Biến / Làm Món */}
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1 d-flex align-items-center gap-1">
                            <i className="bi bi-clock-history text-amber-600"></i>
                            <span>Thời Gian Làm (Phút)</span>
                          </label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              min="1"
                              max="180"
                              required
                              value={duLieuFormThem.thoi_gian_nau}
                              onChange={(e) =>
                                setDuLieuFormThem({ ...duLieuFormThem, thoi_gian_nau: e.target.value })
                              }
                              placeholder="15"
                              className="form-control form-control-sm bg-slate-50 border-slate-200 text-xs py-2 font-bold text-slate-900"
                            />
                            <span className="input-group-text bg-slate-100 border-slate-200 text-xs text-slate-600 font-bold">
                              phút
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">Khách sẽ biết món làm bao lâu</span>
                        </div>

                        {/* Trạng Thái Phục Vụ */}
                        <div className="col-6">
                          <label className="form-label text-xs font-bold text-slate-700 uppercase mb-1">
                            Trạng Thái Phục Vụ
                          </label>
                          <select
                            value={duLieuFormThem.trang_thai}
                            onChange={(e) =>
                              setDuLieuFormThem({ ...duLieuFormThem, trang_thai: e.target.value })
                            }
                            className="form-select form-select-sm bg-slate-50 border-slate-200 text-xs py-2 font-semibold"
                          >
                            <option value="con_hang">🟢 Còn Hàng (Phục vụ ngay)</option>
                            <option value="het_hang">🔴 Tạm Hết Hàng</option>
                            <option value="tam_ngung">⚪ Tạm Ngưng Bán</option>
                          </select>
                        </div>
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
                      className="btn btn-primary text-white px-4 py-2 rounded-pill fw-bold text-xs shadow-sm d-flex align-items-center gap-1.5"
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
