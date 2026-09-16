/**
 * @file banAnController.js
 * @description Tầng xử lý nghiệp vụ Quản lý Bàn ăn & Sơ đồ mặt bằng (Table Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachBan (getTables): Lấy danh sách toàn bộ bàn ăn, gom nhóm số món đang nấu và tổng tiền tạm tính theo từng bàn.
 * 2. layChiTietBan (getTableById): Tra cứu thông tin chi tiết của 1 bàn theo ID (phục vụ khách tự quét QR đặt món).
 * 3. capNhatTrangThaiBan (updateTableStatus): Đổi trạng thái bàn (trong, co_khach, da_dat) và phát Socket realtime.
 * 4. capNhatSoLuongKhach (updateGuestCount): Cập nhật số thực khách đang dùng bữa tại bàn.
 * 5. goiNhanVienPhucVu (callWaiter): Khách bấm chuông gọi phục vụ từ trang QR, phát sóng chuông reo tới nhân viên.
 * 6. yeuCauThanhToan (requestPayment): Khách bấm yêu cầu thanh toán (VietQR hoặc tiền mặt), bật cờ báo động tại quầy thu ngân.
 * 7. guiDanhGiaPhanHoi (submitReview): Khách gửi chấm sao đánh giá, tự động kích hoạt CẢNH BÁO ĐỎ nếu đánh giá kém.
 * 8. taoBanMoi (createTable): Thêm bàn ăn mới vào sơ đồ nhà hàng (chỉ dành cho Admin).
 * @module controllers/banAnController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { BanAn, DatMon, DanhGia, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { phatSuKienTrangThaiBan } from '../utils/truyenThongSocket.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách tất cả các bàn ăn kèm thông tin tạm tính và số món chưa thanh toán
 * @function layDanhSachBan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layDanhSachBan(req, res) {
  try {
    const { khu_vuc } = req.query;
    const boLoc = {};

    if (khu_vuc && khu_vuc !== 'all') {
      boLoc.khu_vuc = khu_vuc;
    }

    const danhSachBan = await BanAn.find(boLoc).sort({ so_ban: 1 });

    // Sử dụng MongoDB Aggregation Pipeline gom nhóm tổng tiền và số món chưa thanh toán
    const donMonDangPhucVu = await DatMon.aggregate([
      {
        $match: {
          phuong_thuc_thanh_toan: 'chua_thanh_toan',
          trang_thai: { $ne: 'da_huy' }
        }
      },
      {
        $group: {
          _id: '$ban_id',
          tam_tinh: { $sum: '$tong_tien' },
          so_mon: { $sum: 1 }
        }
      }
    ]);

    const anhXaDonMon = {};
    donMonDangPhucVu.forEach(don => {
      anhXaDonMon[don._id] = {
        tam_tinh: don.tam_tinh || 0,
        so_mon: don.so_mon || 0
      };
    });

    const ketQua = danhSachBan.map(ban => {
      const duLieuJson = ban.toJSON();
      const thongKe = anhXaDonMon[ban.id] || anhXaDonMon[ban.so_ban] || { tam_tinh: 0, so_mon: 0 };
      return {
        ...duLieuJson,
        tam_tinh: thongKe.tam_tinh,
        so_mon: thongKe.so_mon
      };
    });

    res.json({ success: true, tables: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy thông tin chi tiết 1 bàn theo mã ID
 * @function layChiTietBan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layChiTietBan(req, res) {
  try {
    const { id } = req.params;
    const banAn = await BanAn.findOne(chuyenDoiBoLocId(id));
    if (!banAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }
    res.json({ success: true, table: banAn.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật trạng thái vận hành của bàn ăn
 * @function capNhatTrangThaiBan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function capNhatTrangThaiBan(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai, so_luong_khach, yeu_cau_thanh_toan } = req.body;

    const duLieuCapNhat = {};
    if (trang_thai !== undefined) duLieuCapNhat.trang_thai = trang_thai;
    if (so_luong_khach !== undefined) duLieuCapNhat.so_luong_khach = so_luong_khach;
    if (yeu_cau_thanh_toan !== undefined) duLieuCapNhat.yeu_cau_thanh_toan = yeu_cau_thanh_toan;

    const banDaCapNhat = await BanAn.findOneAndUpdate(
      chuyenDoiBoLocId(id),
      duLieuCapNhat,
      { returnDocument: 'after' }
    );
    if (!banDaCapNhat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    const duLieuBan = banDaCapNhat.toJSON();
    phatSuKienTrangThaiBan(duLieuBan);

    res.json({ success: true, message: 'Cập nhật trạng thái bàn thành công!', table: duLieuBan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật số lượng khách đang ngồi tại bàn
 * @function capNhatSoLuongKhach
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function capNhatSoLuongKhach(req, res) {
  try {
    const { id } = req.params;
    const { so_luong_khach = 1 } = req.body;
    const soLuong = Math.max(1, Number(so_luong_khach) || 1);

    const banAn = await BanAn.findOne(chuyenDoiBoLocId(id));
    if (!banAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    banAn.so_luong_khach = soLuong;
    if (banAn.trang_thai === 'trong') {
      banAn.trang_thai = 'co_khach';
    }
    await banAn.save();

    const duLieuBan = banAn.toJSON();
    phatSuKienTrangThaiBan(duLieuBan);

    res.json({ success: true, message: 'Đã cập nhật số lượng khách!', table: duLieuBan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Khách quét mã QR bấm chuông gọi nhân viên phục vụ
 * @function goiNhanVienPhucVu
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function goiNhanVienPhucVu(req, res) {
  try {
    const { id } = req.params;
    const banAn = await BanAn.findOne(chuyenDoiBoLocId(id));
    if (!banAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    const duLieuBan = banAn.toJSON();
    phatSuKienTrangThaiBan({
      ...duLieuBan,
      goi_phuc_vu: true,
      call_time: new Date().toLocaleTimeString('vi-VN')
    });

    res.json({
      success: true,
      message: `🔔 Đã gửi tín hiệu gọi nhân viên phục vụ tới Bàn ${banAn.so_ban}!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Khách quét mã QR bấm yêu cầu thanh toán
 * @function yeuCauThanhToan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function yeuCauThanhToan(req, res) {
  try {
    const { id } = req.params;
    const { phuong_thuc = 'chuyen_khoan' } = req.body;

    const banAn = await BanAn.findOneAndUpdate(
      chuyenDoiBoLocId(id),
      { yeu_cau_thanh_toan: 1 },
      { returnDocument: 'after' }
    );
    if (!banAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    const duLieuBan = banAn.toJSON();
    phatSuKienTrangThaiBan(duLieuBan);

    res.json({
      success: true,
      message: `💳 Đã gửi yêu cầu thanh toán (${phuong_thuc === 'chuyen_khoan' ? 'Chuyển khoản VietQR' : 'Tiền mặt'}) tới Thu Ngân!`,
      table: duLieuBan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Khách hàng gửi đánh giá và nhận xét chất lượng bữa ăn
 * @function guiDanhGiaPhanHoi
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function guiDanhGiaPhanHoi(req, res) {
  try {
    const { ban_id, so_sao = 5, noi_dung_danh_gia = '' } = req.body;
    const maSoMoi = await layMaSoTiepTheo('review_id');
    const soSaoHopLe = Math.max(1, Math.min(5, Number(so_sao) || 5));
    const canh_bao_do = soSaoHopLe <= 2 ? 1 : 0;

    const danhGiaMoi = await DanhGia.create({
      id: maSoMoi,
      ban_id: Number(ban_id),
      so_sao: soSaoHopLe,
      noi_dung_danh_gia: noi_dung_danh_gia.trim(),
      canh_bao_do
    });

    res.json({
      success: true,
      message: canh_bao_do 
        ? '🚨 Hệ thống đã gửi CẢNH BÁO ĐỎ tới Quản lý để hỗ trợ bạn ngay lập tức!' 
        : `🎉 Cảm ơn quý khách đã đánh giá ${soSaoHopLe} sao cho nhà hàng!`,
      canh_bao_do,
      review: danhGiaMoi.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Thêm bàn ăn mới vào sơ đồ nhà hàng
 * @function taoBanMoi
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function taoBanMoi(req, res) {
  try {
    const { so_ban, suc_chua = 4, khu_vuc = 'Tầng 1 - Sảnh Chính' } = req.body;

    const daTonTai = await BanAn.findOne({ so_ban: Number(so_ban) });
    if (daTonTai) {
      return res.status(400).json({ success: false, message: `Bàn số ${so_ban} đã tồn tại.` });
    }

    const maSoMoi = await layMaSoTiepTheo('table_id');
    const banMoi = await BanAn.create({
      id: maSoMoi,
      so_ban: Number(so_ban),
      suc_chua: Number(suc_chua),
      trang_thai: 'trong',
      khu_vuc
    });

    res.status(201).json({ success: true, message: 'Thêm bàn mới thành công!', table: banMoi.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getTables = layDanhSachBan;
export const getTableById = layChiTietBan;
export const updateTableStatus = capNhatTrangThaiBan;
export const updateGuestCount = capNhatSoLuongKhach;
export const callWaiter = goiNhanVienPhucVu;
export const requestPayment = yeuCauThanhToan;
export const submitReview = guiDanhGiaPhanHoi;
export const createTable = taoBanMoi;

export default {
  layDanhSachBan,
  layChiTietBan,
  capNhatTrangThaiBan,
  capNhatSoLuongKhach,
  goiNhanVienPhucVu,
  yeuCauThanhToan,
  guiDanhGiaPhanHoi,
  taoBanMoi,
  getTables,
  getTableById,
  updateTableStatus,
  updateGuestCount,
  callWaiter,
  requestPayment,
  submitReview,
  createTable
};
