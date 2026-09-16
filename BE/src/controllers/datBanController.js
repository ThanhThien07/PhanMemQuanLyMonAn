/**
 * @file datBanController.js
 * @description Tầng xử lý nghiệp vụ Quản lý Đặt bàn trước (Reservation Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachDatBan (getReservations): Lấy danh sách phiếu đặt bàn, hỗ trợ lọc theo trạng thái và ngày hẹn.
 * 2. taoLichDatBan (createReservation): Tiếp nhận khách đặt bàn tiệc, tự động sinh mã code (RES-xxxxxx), chuyển bàn sang 'da_dat' và phát Socket.
 * 3. khachNhanBanCheckIn (checkinReservation): Tiếp đón khách tới nhà hàng, chuyển phiếu sang 'da_den' và chuyển bàn sang 'co_khach'.
 * 4. huyLichDatBan (cancelReservation): Hủy phiếu đặt bàn và tự động trả bàn về trạng thái 'trong' để đón khách vãng lai.
 * @module controllers/datBanController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { DatBanTruoc, BanAn, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { phatSuKienTrangThaiBan } from '../utils/truyenThongSocket.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách lịch hẹn đặt bàn trước
 * @function layDanhSachDatBan
 * @param {Object} req - Express Request (query: status, date)
 * @param {Object} res - Express Response
 */
export async function layDanhSachDatBan(req, res) {
  try {
    const { status, date } = req.query;
    const boLoc = {};

    if (status) {
      boLoc.trang_thai = status;
    }

    if (date) {
      const thoiDiemDauNgay = new Date(date);
      thoiDiemDauNgay.setHours(0, 0, 0, 0);
      const thoiDiemCuoiNgay = new Date(date);
      thoiDiemCuoiNgay.setHours(23, 59, 59, 999);
      boLoc.thoi_gian_hen = { $gte: thoiDiemDauNgay, $lte: thoiDiemCuoiNgay };
    }

    const danhSachDatBan = await DatBanTruoc.find(boLoc).sort({ thoi_gian_hen: 1 });
    const danhSachBanId = danhSachDatBan.map(r => r.ban_id).filter(Boolean);
    const danhSachBan = await BanAn.find({ id: { $in: danhSachBanId } });
    const anhXaBan = {};
    danhSachBan.forEach(t => { anhXaBan[t.id] = t; });

    const ketQua = danhSachDatBan.map(r => {
      const json = r.toJSON();
      const ban = anhXaBan[r.ban_id];
      return {
        ...json,
        so_ban: ban?.so_ban || r.ban_id,
        khu_vuc: ban?.khu_vuc || ''
      };
    });

    res.json({ success: true, reservations: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Khởi tạo lịch hẹn đặt bàn trước cho khách
 * @function taoLichDatBan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function taoLichDatBan(req, res) {
  try {
    const { ten_khach, sdt, ban_id, thoi_gian_hen, so_luong_khach = 2, tien_coc = 0, ghi_chu = '' } = req.body;

    if (!ten_khach || !sdt || !thoi_gian_hen) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên khách, SĐT và thời gian hẹn.' });
    }

    const ma_reservation = 'RES-' + Date.now().toString().slice(-6);
    const maSoMoi = await layMaSoTiepTheo('reservation_id');

    const phieuDatMoi = await DatBanTruoc.create({
      id: maSoMoi,
      ma_reservation,
      ten_khach: ten_khach.trim(),
      sdt: sdt.trim(),
      ban_id: ban_id ? Number(ban_id) : null,
      thoi_gian_hen: new Date(thoi_gian_hen),
      so_luong_khach: Number(so_luong_khach) || 2,
      tien_coc: Number(tien_coc) || 0,
      ghi_chu: ghi_chu || '',
      trang_thai: 'da_xac_nhan'
    });

    // Nếu chỉ định bàn cụ thể, cập nhật bàn sang trạng thái 'da_dat'
    if (ban_id) {
      const banDaCapNhat = await BanAn.findOneAndUpdate(
        { id: Number(ban_id), trang_thai: 'trong' },
        { trang_thai: 'da_dat' },
        { returnDocument: 'after' }
      );
      if (banDaCapNhat) phatSuKienTrangThaiBan(banDaCapNhat.toJSON());
    }

    res.status(201).json({ success: true, message: 'Tạo lịch đặt bàn thành công!', reservation: phieuDatMoi.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tiếp đón khách đến dùng bữa và thực hiện Check-in nhận bàn
 * @function khachNhanBanCheckIn
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function khachNhanBanCheckIn(req, res) {
  try {
    const { id } = req.params;
    const phieuDat = await DatBanTruoc.findOne(chuyenDoiBoLocId(id));
    if (!phieuDat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt bàn.' });
    }

    phieuDat.trang_thai = 'da_den';
    await phieuDat.save();

    if (phieuDat.ban_id) {
      const banAn = await BanAn.findOneAndUpdate(
        { id: phieuDat.ban_id },
        { trang_thai: 'co_khach', so_luong_khach: phieuDat.so_luong_khach },
        { returnDocument: 'after' }
      );
      if (banAn) phatSuKienTrangThaiBan(banAn.toJSON());
    }

    res.json({ success: true, message: 'Check-in thành công! Khách đã vào bàn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Hủy lịch hẹn đặt bàn
 * @function huyLichDatBan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function huyLichDatBan(req, res) {
  try {
    const { id } = req.params;
    const phieuDat = await DatBanTruoc.findOne(chuyenDoiBoLocId(id));
    if (!phieuDat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt bàn.' });
    }

    phieuDat.trang_thai = 'da_huy';
    await phieuDat.save();

    if (phieuDat.ban_id) {
      const banAn = await BanAn.findOneAndUpdate(
        { id: phieuDat.ban_id, trang_thai: 'da_dat' },
        { trang_thai: 'trong' },
        { returnDocument: 'after' }
      );
      if (banAn) phatSuKienTrangThaiBan(banAn.toJSON());
    }

    res.json({ success: true, message: 'Đã hủy lịch đặt bàn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getReservations = layDanhSachDatBan;
export const createReservation = taoLichDatBan;
export const checkinReservation = khachNhanBanCheckIn;
export const cancelReservation = huyLichDatBan;

export default {
  layDanhSachDatBan,
  taoLichDatBan,
  khachNhanBanCheckIn,
  huyLichDatBan,
  getReservations,
  createReservation,
  checkinReservation,
  cancelReservation
};
