/**
 * @file khoNguyenLieuController.js
 * @description Tầng xử lý nghiệp vụ Quản lý Kho Thực Phẩm & Nhà Cung Cấp (Inventory Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachNguyenLieu (getIngredients): Lấy danh sách toàn bộ nguyên liệu tồn kho, gắn cờ cảnh báo hết hàng is_low_stock nếu tồn <= định mức.
 * 2. capNhatTonKho (updateStock): Nhập kho thêm số lượng (action: 'add') hoặc điều chỉnh số dư kiểm kê thực tế (action: 'set').
 * 3. themNguyenLieuMoi (createIngredient): Khởi tạo nguyên liệu thô mới vào danh mục quản lý kho.
 * 4. layDanhSachNhaCungCap (getSuppliers): Xem danh sách các đối tác cung ứng thực phẩm cho nhà hàng.
 * @module controllers/khoNguyenLieuController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { NguyenLieu, NhaCungCap, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách nguyên vật liệu kho kèm cờ cảnh báo cạn kiệt
 * @function layDanhSachNguyenLieu
 * @param {Object} req - Express Request (query: alert_only, search)
 * @param {Object} res - Express Response
 */
export async function layDanhSachNguyenLieu(req, res) {
  try {
    const { alert_only, search } = req.query;
    const boLoc = {};

    if (search) {
      boLoc.ten_nguyen_lieu = { $regex: search, $options: 'i' };
    }

    const danhSach = await NguyenLieu.find(boLoc);

    // Tính toán cờ cảnh báo is_low_stock cho từng nguyên liệu
    let ketQua = danhSach.map(nl => nl.toJSON());

    if (alert_only === 'true') {
      ketQua = ketQua.filter(nl => nl.so_luong_ton <= nl.dinh_muc_toi_thieu);
    }

    // Sắp xếp ưu tiên: những mặt hàng đang cạn kho được đẩy lên hàng đầu để thủ kho theo dõi
    ketQua.sort((a, b) => {
      if (b.is_low_stock !== a.is_low_stock) {
        return b.is_low_stock - a.is_low_stock;
      }
      return a.so_luong_ton - b.so_luong_ton;
    });

    res.json({ success: true, ingredients: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật số lượng tồn kho (Nhập thêm hoặc Điều chỉnh số dư)
 * @function capNhatTonKho
 * @param {Object} req - Express Request (body: amount, action)
 * @param {Object} res - Express Response
 */
export async function capNhatTonKho(req, res) {
  try {
    const { id } = req.params;
    const { amount, action = 'add' } = req.body; // action: 'add' (nhập thêm) | 'set' (gán số dư)

    const nguyenLieu = await NguyenLieu.findOne(chuyenDoiBoLocId(id));
    if (!nguyenLieu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nguyên liệu trong kho.' });
    }

    let soLuongMoi = nguyenLieu.so_luong_ton;
    if (action === 'add') {
      soLuongMoi += Number(amount) || 0;
    } else {
      soLuongMoi = Number(amount) || 0;
    }

    nguyenLieu.so_luong_ton = Math.max(0, soLuongMoi);
    await nguyenLieu.save();

    res.json({ success: true, message: 'Cập nhật kho thành công!', ingredient: nguyenLieu.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Thêm nguyên vật liệu mới vào hệ thống kho
 * @function themNguyenLieuMoi
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function themNguyenLieuMoi(req, res) {
  try {
    const { ten_nguyen_lieu, don_vi_tinh = 'kg', so_luong_ton = 0, gia_nhap_trung_binh = 0, dinh_muc_toi_thieu = 5 } = req.body;

    if (!ten_nguyen_lieu) {
      return res.status(400).json({ success: false, message: 'Tên nguyên liệu là trường bắt buộc.' });
    }

    const maSoMoi = await layMaSoTiepTheo('ingredient_id');
    const nguyenLieuMoi = await NguyenLieu.create({
      id: maSoMoi,
      ten_nguyen_lieu,
      don_vi_tinh,
      so_luong_ton: Number(so_luong_ton),
      gia_nhap_trung_binh: Number(gia_nhap_trung_binh),
      dinh_muc_toi_thieu: Number(dinh_muc_toi_thieu)
    });

    res.status(201).json({ success: true, message: 'Thêm nguyên liệu vào kho thành công!', ingredient: nguyenLieuMoi.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy danh sách toàn bộ các đối tác nhà cung cấp
 * @function layDanhSachNhaCungCap
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layDanhSachNhaCungCap(req, res) {
  try {
    const danhSachNCC = await NhaCungCap.find({}).sort({ id: 1 });
    res.json({ success: true, suppliers: danhSachNCC });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getIngredients = layDanhSachNguyenLieu;
export const updateStock = capNhatTonKho;
export const createIngredient = themNguyenLieuMoi;
export const getSuppliers = layDanhSachNhaCungCap;

export default {
  layDanhSachNguyenLieu,
  capNhatTonKho,
  themNguyenLieuMoi,
  layDanhSachNhaCungCap,
  getIngredients,
  updateStock,
  createIngredient,
  getSuppliers
};
