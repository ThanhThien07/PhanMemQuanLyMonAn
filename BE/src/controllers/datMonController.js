/**
 * @file datMonController.js
 * @description Tầng xử lý nghiệp vụ Bán hàng POS, Gọi món & Màn hình Bếp KDS (Order Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachDonMon (getOrders): Tra cứu danh sách đơn gọi món theo từng bàn hoặc toàn bộ nhà hàng.
 * 2. layDonMonChoBep (getKitchenOrders): Lấy hàng đợi các món đang chờ chế biến hoặc đang nấu cho màn hình KDS, sắp xếp theo độ ưu tiên.
 * 3. taoDonGoiMon (createOrder): Tiếp nhận order từ POS hoặc khách tự quét mã QR tại bàn, mở bàn nếu đang trống, phát sự kiện Socket 'order:new'.
 * 4. capNhatTrangThaiDonMon (updateOrderStatus): Đổi trạng thái chế biến (chờ -> đang nấu -> đã phục vụ), TỰ ĐỘNG TRỪ KHO nguyên liệu theo công thức BOM.
 * 5. thanhToanHoaDon (payBill): Tính tổng tiền các món, áp dụng giảm trừ tích điểm CRM, cập nhật trạng thái hoàn thành, đưa bàn về 'trong' và phát Socket.
 * @module controllers/datMonController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { DatMon, BanAn, MonAn, KhachHang, MonAnNguyenLieu, NguyenLieu, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { phatSuKienDonMonMoi, phatSuKienTrangThaiMon, phatSuKienTrangThaiBan } from '../utils/truyenThongSocket.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách đơn gọi món theo điều kiện lọc
 * @function layDanhSachDonMon
 * @param {Object} req - Express Request (query: ban_id, status, unpaid_only)
 * @param {Object} res - Express Response
 */
export async function layDanhSachDonMon(req, res) {
  try {
    const { ban_id, status, unpaid_only } = req.query;
    const boLoc = {};

    if (ban_id) {
      boLoc.ban_id = Number(ban_id);
    }

    if (status) {
      boLoc.trang_thai = status;
    }

    if (unpaid_only === 'true') {
      boLoc.phuong_thuc_thanh_toan = 'chua_thanh_toan';
      boLoc.trang_thai = { $ne: 'da_huy' };
    }

    const danhSachDon = await DatMon.find(boLoc).sort({ id: -1 });

    // Thu thập danh sách ID liên quan để truy vấn kèm (Dishes, Tables, Customers)
    const dsMonId = [...new Set(danhSachDon.map(o => o.mon_an_id))];
    const dsBanId = [...new Set(danhSachDon.map(o => o.ban_id))];
    const dsKhachId = [...new Set(danhSachDon.map(o => o.khach_hang_id).filter(Boolean))];

    const [danhSachMon, danhSachBan, danhSachKhach] = await Promise.all([
      MonAn.find({ id: { $in: dsMonId } }),
      BanAn.find({ id: { $in: dsBanId } }),
      KhachHang.find({ id: { $in: dsKhachId } })
    ]);

    const anhXaMon = {};
    danhSachMon.forEach(d => { anhXaMon[d.id] = d; });
    const anhXaBan = {};
    danhSachBan.forEach(t => { anhXaBan[t.id] = t; });
    const anhXaKhach = {};
    danhSachKhach.forEach(c => { anhXaKhach[c.id] = c; });

    const ketQua = danhSachDon.map(don => {
      const json = don.toJSON();
      const mon = anhXaMon[don.mon_an_id];
      const ban = anhXaBan[don.ban_id];
      const khach = anhXaKhach[don.khach_hang_id];

      return {
        ...json,
        ten_mon: mon?.ten_mon || '',
        hinh_anh: mon?.hinh_anh || '',
        gia_goc: mon?.gia || 0,
        so_ban: ban?.so_ban || don.ban_id,
        khu_vuc: ban?.khu_vuc || '',
        ten_khach: khach?.ho_ten || ''
      };
    });

    res.json({ success: true, orders: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy hàng đợi các món đang chờ chế biến dành riêng cho Màn hình Bếp KDS
 * @function layDonMonChoBep
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layDonMonChoBep(req, res) {
  try {
    const danhSachDon = await DatMon.find({
      trang_thai: { $in: ['cho_xac_nhan', 'dang_che_bien'] }
    }).sort({ thu_tu_uu_tien: -1, createdAt: 1 });

    const dsMonId = [...new Set(danhSachDon.map(o => o.mon_an_id))];
    const dsBanId = [...new Set(danhSachDon.map(o => o.ban_id))];

    const [danhSachMon, danhSachBan] = await Promise.all([
      MonAn.find({ id: { $in: dsMonId } }),
      BanAn.find({ id: { $in: dsBanId } })
    ]);

    const anhXaMon = {};
    danhSachMon.forEach(d => { anhXaMon[d.id] = d; });
    const anhXaBan = {};
    danhSachBan.forEach(t => { anhXaBan[t.id] = t; });

    const ketQua = danhSachDon.map(don => {
      const json = don.toJSON();
      const mon = anhXaMon[don.mon_an_id];
      const ban = anhXaBan[don.ban_id];

      return {
        ...json,
        ten_mon: mon?.ten_mon || '',
        hinh_anh: mon?.hinh_anh || '',
        so_ban: ban?.so_ban || don.ban_id,
        khu_vuc: ban?.khu_vuc || ''
      };
    });

    res.json({ success: true, orders: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tạo đơn gọi món mới (tiếp nhận từ POS sảnh hoặc khách tự quét QR đặt tại bàn)
 * @function taoDonGoiMon
 * @param {Object} req - Express Request (body: ban_id, items, khach_hang_id, so_luong_khach)
 * @param {Object} res - Express Response
 */
export async function taoDonGoiMon(req, res) {
  try {
    const { ban_id, items, khach_hang_id, so_luong_khach = 1 } = req.body;

    if (!ban_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn bàn và ít nhất 1 món ăn.' });
    }

    const banAn = await BanAn.findOne(chuyenDoiBoLocId(ban_id));
    if (!banAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    // Tự động chuyển bàn sang trạng thái 'co_khach' nếu đang trống hoặc đã đặt
    if (banAn.trang_thai === 'trong' || banAn.trang_thai === 'da_dat') {
      banAn.trang_thai = 'co_khach';
      banAn.so_luong_khach = Number(so_luong_khach) || banAn.so_luong_khach || 1;
      await banAn.save();
      phatSuKienTrangThaiBan(banAn.toJSON());
    }

    const danhSachDonMoi = [];

    for (const item of items) {
      const monAn = await MonAn.findOne(chuyenDoiBoLocId(item.mon_an_id));
      if (!monAn) continue;

      const don_gia = monAn.gia;
      const so_luong = Number(item.so_luong) || 1;
      const tong_tien = don_gia * so_luong;
      const options_json = typeof item.options === 'object' ? JSON.stringify(item.options) : (item.options || '{}');

      const maDonMoi = await layMaSoTiepTheo('order_id');
      const donDat = await DatMon.create({
        id: maDonMoi,
        ban_id: banAn.id,
        mon_an_id: monAn.id,
        khach_hang_id: khach_hang_id ? Number(khach_hang_id) : null,
        so_luong,
        don_gia,
        tong_tien,
        options_json,
        ghi_chu: item.ghi_chu || '',
        trang_thai: 'cho_xac_nhan',
        phuong_thuc_thanh_toan: 'chua_thanh_toan',
        thu_tu_uu_tien: item.priority || 1,
        so_luong_khach: Number(so_luong_khach) || 1
      });

      const duLieuDon = {
        ...donDat.toJSON(),
        ten_mon: monAn.ten_mon,
        hinh_anh: monAn.hinh_anh,
        so_ban: banAn.so_ban,
        khu_vuc: banAn.khu_vuc
      };

      danhSachDonMoi.push(duLieuDon);
      phatSuKienDonMonMoi(duLieuDon);
    }

    res.status(201).json({
      success: true,
      message: 'Gọi món thành công! Đã gửi thông báo đơn món tới Bếp.',
      orders: danhSachDonMoi
    });
  } catch (error) {
    console.error('Lỗi taoDonGoiMon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật trạng thái chế biến món ăn & TỰ ĐỘNG TRỪ KHO NGUYÊN LIỆU THEO ĐỊNH LƯỢNG BOM
 * @function capNhatTrangThaiDonMon
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function capNhatTrangThaiDonMon(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    const donMon = await DatMon.findOne(chuyenDoiBoLocId(id));
    if (!donMon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn món.' });
    }

    // Khi bếp nhận đơn và chuyển sang 'dang_che_bien', hệ thống tự động dò tìm định lượng BOM và khấu trừ kho
    if (trang_thai === 'dang_che_bien' && donMon.trang_thai === 'cho_xac_nhan') {
      const danhSachBOM = await MonAnNguyenLieu.find({ mon_an_id: donMon.mon_an_id });
      for (const bom of danhSachBOM) {
        const soLuongTru = bom.so_luong_can * donMon.so_luong;
        const nguyenLieu = await NguyenLieu.findOne({ id: bom.nguyen_lieu_id });
        if (nguyenLieu) {
          nguyenLieu.so_luong_ton = Math.max(0, nguyenLieu.so_luong_ton - soLuongTru);
          await nguyenLieu.save();
        }
      }
    }

    donMon.trang_thai = trang_thai;
    await donMon.save();

    const [monAn, banAn] = await Promise.all([
      MonAn.findOne({ id: donMon.mon_an_id }),
      BanAn.findOne({ id: donMon.ban_id })
    ]);

    const duLieuCapNhat = {
      ...donMon.toJSON(),
      ten_mon: monAn?.ten_mon || '',
      so_ban: banAn?.so_ban || donMon.ban_id
    };

    phatSuKienTrangThaiMon(duLieuCapNhat);

    res.json({ success: true, message: `Đã cập nhật trạng thái món sang: ${trang_thai}`, order: duLieuCapNhat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Thanh toán toàn bộ hóa đơn cho một Bàn ăn
 * @function thanhToanHoaDon
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function thanhToanHoaDon(req, res) {
  try {
    const { ban_id } = req.params;
    const { phuong_thuc_thanh_toan = 'tien_mat', khach_hang_id, discount = 0 } = req.body;

    const maBanSo = Number(ban_id);
    const cacMonChuaThanhToan = await DatMon.find({
      ban_id: maBanSo,
      phuong_thuc_thanh_toan: 'chua_thanh_toan',
      trang_thai: { $ne: 'da_huy' }
    });

    if (cacMonChuaThanhToan.length === 0) {
      return res.status(400).json({ success: false, message: 'Bàn này không có món nào cần thanh toán.' });
    }

    let tongTien = cacMonChuaThanhToan.reduce((sum, item) => sum + (item.tong_tien || 0), 0);
    const tongTienSauGiam = Math.max(0, tongTien - discount);

    // Chuyển toàn bộ các món sang 'hoan_thanh' và ghi nhận phương thức thanh toán
    await DatMon.updateMany(
      {
        ban_id: maBanSo,
        phuong_thuc_thanh_toan: 'chua_thanh_toan',
        trang_thai: { $ne: 'da_huy' }
      },
      {
        $set: {
          phuong_thuc_thanh_toan,
          trang_thai: 'hoan_thanh'
        }
      }
    );

    // Tích điểm thưởng cho thành viên CRM nếu có (100.000đ = 1 điểm)
    if (khach_hang_id) {
      const diemCong = Math.floor(tongTienSauGiam / 100000);
      await KhachHang.findOneAndUpdate(
        { id: Number(khach_hang_id) },
        {
          $inc: {
            diem_tich_luy: diemCong,
            tong_chi_tieu: tongTienSauGiam
          }
        }
      );
    }

    // Đưa bàn ăn về trạng thái 'trong', giải phóng số lượng khách
    const banDaGiaiPhong = await BanAn.findOneAndUpdate(
      { id: maBanSo },
      {
        $set: {
          trang_thai: 'trong',
          so_luong_khach: 0,
          yeu_cau_thanh_toan: 0
        }
      },
      { returnDocument: 'after' }
    );

    if (banDaGiaiPhong) {
      phatSuKienTrangThaiBan(banDaGiaiPhong.toJSON());
    }

    res.json({
      success: true,
      message: 'Thanh toán thành công! Bàn đã được dọn sạch.',
      billSummary: {
        ban_id: maBanSo,
        tongTien,
        discount,
        finalTotal: tongTienSauGiam,
        phuong_thuc_thanh_toan,
        so_mon: cacMonChuaThanhToan.length
      }
    });
  } catch (error) {
    console.error('Lỗi thanhToanHoaDon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getOrders = layDanhSachDonMon;
export const getKitchenOrders = layDonMonChoBep;
export const createOrder = taoDonGoiMon;
export const updateOrderStatus = capNhatTrangThaiDonMon;
export const payBill = thanhToanHoaDon;

export default {
  layDanhSachDonMon,
  layDonMonChoBep,
  taoDonGoiMon,
  capNhatTrangThaiDonMon,
  thanhToanHoaDon,
  getOrders,
  getKitchenOrders,
  createOrder,
  updateOrderStatus,
  payBill
};
