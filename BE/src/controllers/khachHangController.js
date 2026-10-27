/**
 * @file khachHangController.js
 * @description Tầng xử lý nghiệp vụ Khách hàng Thân thiết & Chương trình CRM (Customer Controller).
 * Chịu trách nhiệm:
 * 1. layDanhSachKhachHang (getCustomers): Lấy danh sách thành viên nhà hàng, hỗ trợ tìm kiếm theo tên hoặc số điện thoại, xếp hạng theo điểm tích lũy.
 * 2. taoKhachHangMoi (createCustomer): Đăng ký thông tin khách hàng mới, khởi tạo số điểm tích lũy ban đầu và cấp hạng thẻ thành viên.
 * @module controllers/khachHangController
 * @author Nguyễn Hoàng Hưng
 */

import { KhachHang, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';

/**
 * Lấy danh sách khách hàng thân thiết có tìm kiếm và sắp xếp theo điểm tích lũy
 * @function layDanhSachKhachHang
 * @param {Object} req - Express Request (query: search)
 * @param {Object} res - Express Response
 */
export async function layDanhSachKhachHang(req, res) {
  try {
    const { search } = req.query;
    const boLoc = {};

    if (search) {
      boLoc.$or = [
        { ho_ten: { $regex: search, $options: 'i' } },
        { so_dien_thoai: { $regex: search, $options: 'i' } }
      ];
    }

    const danhSachKhach = await KhachHang.find(boLoc).sort({ diem_tich_luy: -1 });
    res.json({ success: true, customers: danhSachKhach.map(c => c.toJSON()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đăng ký hồ sơ khách hàng mới vào hệ thống CRM
 * @function taoKhachHangMoi
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function taoKhachHangMoi(req, res) {
  try {
    const { ho_ten, so_dien_thoai, email } = req.body;
    if (!ho_ten || !so_dien_thoai) {
      return res.status(400).json({ success: false, message: 'Họ tên và số điện thoại là bắt buộc.' });
    }

    const daDangKy = await KhachHang.findOne({ so_dien_thoai: so_dien_thoai.trim() });
    if (daDangKy) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký trên hệ thống.' });
    }

    const maSoMoi = await layMaSoTiepTheo('customer_id');
    const khachMoi = await KhachHang.create({
      id: maSoMoi,
      ho_ten: ho_ten.trim(),
      so_dien_thoai: so_dien_thoai.trim(),
      email: email || '',
      diem_tich_luy: 0,
      hang_thanh_vien: 'Dong',
      tong_chi_tieu: 0
    });

    res.status(201).json({ success: true, message: 'Thêm khách hàng thành công!', customer: khachMoi.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật hồ sơ khách hàng (họ tên, email, điểm tích lũy, hạng thẻ)
 */
export async function capNhatKhachHang(req, res) {
  try {
    const { id } = req.params;
    const { ho_ten, email, diem_tich_luy, hang_thanh_vien } = req.body;

    const khachHang = await KhachHang.findOne({ id: Number(id) });
    if (!khachHang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ khách hàng.' });
    }

    if (ho_ten) khachHang.ho_ten = ho_ten.trim();
    if (email !== undefined) khachHang.email = email.trim();
    if (diem_tich_luy !== undefined) khachHang.diem_tich_luy = Number(diem_tich_luy);
    if (hang_thanh_vien) khachHang.hang_thanh_vien = hang_thanh_vien;

    await khachHang.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin khách hàng thành công!',
      customer: khachHang.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Xóa hồ sơ khách hàng
 */
export async function xoaKhachHang(req, res) {
  try {
    const { id } = req.params;
    const ketQua = await KhachHang.deleteOne({ id: Number(id) });
    if (ketQua.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ khách hàng.' });
    }

    res.json({
      success: true,
      message: 'Đã xóa hồ sơ khách hàng thành công!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getCustomers = layDanhSachKhachHang;
export const createCustomer = taoKhachHangMoi;
export const updateCustomer = capNhatKhachHang;
export const deleteCustomer = xoaKhachHang;

export default {
  layDanhSachKhachHang,
  taoKhachHangMoi,
  capNhatKhachHang,
  xoaKhachHang,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
