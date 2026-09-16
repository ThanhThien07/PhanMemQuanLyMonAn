/**
 * @file monAnController.js
 * @description Tầng xử lý nghiệp vụ Quản lý Thực đơn & Món ăn (Dish & Menu Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachLoaiMon (getCategories): Lấy danh mục các nhóm món ăn (Khai vị, Món chính, Đồ uống...).
 * 2. layDanhSachMonAn (getDishes): Lấy danh sách món ăn, hỗ trợ lọc theo danh mục, trạng thái và tìm kiếm từ khóa Regex.
 * 3. layChiTietMonAn (getDishById): Xem thông tin chi tiết một món ăn kèm công thức định lượng nguyên liệu kho (BOM).
 * 4. themMonAnMoi (createDish): Thêm món ăn mới vào thực đơn, lưu kèm công thức định lượng tiêu hao nguyên liệu.
 * 5. capNhatMonAn (updateDish): Cập nhật tên, đơn giá, hình ảnh, mô tả hoặc tạm ngừng phục vụ món.
 * 6. xoaMonAn (deleteDish): Xóa món ăn khỏi thực đơn và tự động dọn dẹp các bản ghi định lượng BOM liên quan.
 * @module controllers/monAnController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { LoaiMon, MonAn, MonAnNguyenLieu, NguyenLieu, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách tất cả các loại / nhóm danh mục món ăn
 * @function layDanhSachLoaiMon
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layDanhSachLoaiMon(req, res) {
  try {
    const danhSachLoai = await LoaiMon.find({}).sort({ id: 1 });
    res.json({ success: true, categories: danhSachLoai });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy danh sách món ăn có phân trang và bộ lọc tìm kiếm
 * @function layDanhSachMonAn
 * @param {Object} req - Express Request (query: category_id, search, status)
 * @param {Object} res - Express Response
 */
export async function layDanhSachMonAn(req, res) {
  try {
    const { category_id, search, status } = req.query;
    const boLoc = {};

    if (category_id && category_id !== 'all') {
      boLoc.loai_mon_id = Number(category_id);
    }

    if (status) {
      boLoc.trang_thai = status;
    }

    if (search) {
      boLoc.$or = [
        { ten_mon: { $regex: search, $options: 'i' } },
        { mo_ta: { $regex: search, $options: 'i' } }
      ];
    }

    const danhSachMon = await MonAn.find(boLoc).sort({ id: -1 });
    const danhSachLoai = await LoaiMon.find({});
    const anhXaLoai = {};
    danhSachLoai.forEach(loai => {
      anhXaLoai[loai.id] = loai;
    });

    const ketQua = danhSachMon.map(mon => {
      const jsonMon = mon.toJSON();
      const loai = anhXaLoai[mon.loai_mon_id];
      return {
        ...jsonMon,
        ten_loai: loai?.ten_loai || '',
        ma_loai: loai?.ma_loai || ''
      };
    });

    res.json({ success: true, dishes: ketQua });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy chi tiết món ăn kèm công thức định lượng nguyên liệu kho (BOM)
 * @function layChiTietMonAn
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layChiTietMonAn(req, res) {
  try {
    const { id } = req.params;
    const monAn = await MonAn.findOne(chuyenDoiBoLocId(id));
    if (!monAn) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn.' });
    }

    const loai = await LoaiMon.findOne({ id: monAn.loai_mon_id });
    const duLieuMon = {
      ...monAn.toJSON(),
      ten_loai: loai?.ten_loai || '',
      ma_loai: loai?.ma_loai || ''
    };

    // Lấy công thức định lượng BOM từ bảng MonAnNguyenLieu
    const danhSachBOM = await MonAnNguyenLieu.find({ mon_an_id: monAn.id });
    const danhSachIdNguyenLieu = danhSachBOM.map(b => b.nguyen_lieu_id);
    const danhSachNguyenLieu = await NguyenLieu.find({ id: { $in: danhSachIdNguyenLieu } });
    const anhXaNguyenLieu = {};
    danhSachNguyenLieu.forEach(nl => {
      anhXaNguyenLieu[nl.id] = nl;
    });

    const ketQuaBOM = danhSachBOM.map(b => {
      const nl = anhXaNguyenLieu[b.nguyen_lieu_id];
      return {
        ...b.toJSON(),
        ten_nguyen_lieu: nl?.ten_nguyen_lieu || '',
        so_luong_ton: nl?.so_luong_ton || 0,
        dvt_kho: nl?.don_vi_tinh || 'kg'
      };
    });

    res.json({ success: true, dish: duLieuMon, bom: ketQuaBOM });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Thêm món ăn mới vào thực đơn
 * @function themMonAnMoi
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function themMonAnMoi(req, res) {
  try {
    const { ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai = 'con_hang', bom = [] } = req.body;

    if (!ten_mon || gia === undefined) {
      return res.status(400).json({ success: false, message: 'Tên món ăn và đơn giá là bắt buộc.' });
    }

    const maSoMoi = await layMaSoTiepTheo('dish_id');
    const monMoi = await MonAn.create({
      id: maSoMoi,
      ten_mon,
      loai_mon_id: loai_mon_id ? Number(loai_mon_id) : null,
      gia: Number(gia),
      mo_ta: mo_ta || '',
      hinh_anh: hinh_anh || '',
      trang_thai
    });

    // Lưu định lượng BOM công thức nấu ăn nếu có truyền lên
    if (Array.isArray(bom) && bom.length > 0) {
      for (const item of bom) {
        if (item.nguyen_lieu_id && item.so_luong_can) {
          const maBOM = await layMaSoTiepTheo('dish_ingredient_id');
          await MonAnNguyenLieu.create({
            id: maBOM,
            mon_an_id: maSoMoi,
            nguyen_lieu_id: Number(item.nguyen_lieu_id),
            so_luong_can: Number(item.so_luong_can),
            don_vi_tinh: item.don_vi_tinh || 'kg'
          });
        }
      }
    }

    res.status(201).json({ success: true, message: 'Thêm món ăn thành công!', dish: monMoi.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật thông tin món ăn trong thực đơn
 * @function capNhatMonAn
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function capNhatMonAn(req, res) {
  try {
    const { id } = req.params;
    const { ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai } = req.body;

    const duLieuCapNhat = {};
    if (ten_mon !== undefined) duLieuCapNhat.ten_mon = ten_mon;
    if (loai_mon_id !== undefined) duLieuCapNhat.loai_mon_id = Number(loai_mon_id);
    if (gia !== undefined) duLieuCapNhat.gia = Number(gia);
    if (mo_ta !== undefined) duLieuCapNhat.mo_ta = mo_ta;
    if (hinh_anh !== undefined) duLieuCapNhat.hinh_anh = hinh_anh;
    if (trang_thai !== undefined) duLieuCapNhat.trang_thai = trang_thai;

    const monDaCapNhat = await MonAn.findOneAndUpdate(
      chuyenDoiBoLocId(id),
      duLieuCapNhat,
      { returnDocument: 'after' }
    );
    if (!monDaCapNhat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn.' });
    }

    res.json({ success: true, message: 'Cập nhật món ăn thành công!', dish: monDaCapNhat.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Xóa món ăn khỏi thực đơn và tự động xóa bỏ công thức BOM liên quan
 * @function xoaMonAn
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function xoaMonAn(req, res) {
  try {
    const { id } = req.params;
    const monAn = await MonAn.findOne(chuyenDoiBoLocId(id));
    if (monAn) {
      await MonAnNguyenLieu.deleteMany({ mon_an_id: monAn.id });
      await MonAn.deleteOne({ _id: monAn._id });
    }

    res.json({ success: true, message: 'Đã xóa món ăn thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getCategories = layDanhSachLoaiMon;
export const getDishes = layDanhSachMonAn;
export const getDishById = layChiTietMonAn;
export const createDish = themMonAnMoi;
export const updateDish = capNhatMonAn;
export const deleteDish = xoaMonAn;

export default {
  layDanhSachLoaiMon,
  layDanhSachMonAn,
  layChiTietMonAn,
  themMonAnMoi,
  capNhatMonAn,
  xoaMonAn,
  getCategories,
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish
};
