/**
 * @file nguoiDungController.js
 * @description Tầng xử lý nghiệp vụ Quản lý Tài khoản Người dùng & Khách hàng (User Account Controller).
 * Dành cho Quản trị viên (Admin):
 * 1. layDanhSachTaiKhoan: Lấy danh sách toàn bộ tài khoản (Admin, Nhân viên, Bếp, Thu ngân, Khách hàng)
 * 2. taoTaiKhoanMoi: Admin chủ động tạo tài khoản mới
 * 3. capNhatTaiKhoan: Sửa thông tin tài khoản (Họ tên, SĐT, Role, Mật khẩu mới)
 * 4. doiTrangThaiTaiKhoan: Khóa hoặc mở khóa tài khoản ('hoat_dong' <-> 'tam_khoa')
 * 5. xoaTaiKhoan: Xóa vĩnh viễn tài khoản khỏi hệ thống
 * @module controllers/nguoiDungController
 * @author Nguyễn Hoàng Hưng
 */

import bcrypt from 'bcryptjs';
import { NguoiDung, KhachHang, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Lấy danh sách toàn bộ tài khoản có tìm kiếm và phân loại vai trò
 */
export async function layDanhSachTaiKhoan(req, res) {
  try {
    const { search, role } = req.query;
    const boLoc = {};

    if (role && role !== 'all') {
      boLoc.role = role;
    }

    if (search) {
      boLoc.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { so_dien_thoai: { $regex: search, $options: 'i' } }
      ];
    }

    const danhSach = await NguoiDung.find(boLoc)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: danhSach.map((u) => u.toJSON())
    });
  } catch (error) {
    console.error('Lỗi layDanhSachTaiKhoan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tạo tài khoản mới từ phía Quản trị viên
 */
export async function taoTaiKhoanMoi(req, res) {
  try {
    const { name, email, password, role = 'khach_hang', so_dien_thoai = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên, email và mật khẩu là bắt buộc.'
      });
    }

    const daTonTai = await NguoiDung.findOne({ email: email.toLowerCase().trim() });
    if (daTonTai) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email này đã tồn tại trên hệ thống.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const matKhauDaBam = await bcrypt.hash(password, salt);
    const maSoMoi = await layMaSoTiepTheo('user_id');

    const taiKhoanMoi = await NguoiDung.create({
      id: maSoMoi,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: matKhauDaBam,
      role,
      so_dien_thoai: so_dien_thoai.trim(),
      trang_thai: 'hoat_dong'
    });

    // Nếu tạo tài khoản khách hàng, tự động liên kết tạo hồ sơ CRM Khách Hàng nếu chưa có
    if (role === 'khach_hang' && so_dien_thoai) {
      const khachCrm = await KhachHang.findOne({ so_dien_thoai: so_dien_thoai.trim() });
      if (!khachCrm) {
        const maKhach = await layMaSoTiepTheo('customer_id');
        await KhachHang.create({
          id: maKhach,
          ho_ten: name.trim(),
          so_dien_thoai: so_dien_thoai.trim(),
          email: email.toLowerCase().trim(),
          diem_tich_luy: 0,
          hang_thanh_vien: 'Dong',
          tong_chi_tieu: 0
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công!',
      user: taiKhoanMoi.toJSON()
    });
  } catch (error) {
    console.error('Lỗi taoTaiKhoanMoi:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật thông tin tài khoản (Họ tên, SĐT, Role, Mật khẩu mới nếu có)
 */
export async function capNhatTaiKhoan(req, res) {
  try {
    const { id } = req.params;
    const { name, role, so_dien_thoai, password, trang_thai } = req.body;

    const taiKhoan = await NguoiDung.findOne(chuyenDoiBoLocId(id));
    if (!taiKhoan) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    if (name) taiKhoan.name = name.trim();
    if (role) taiKhoan.role = role;
    if (so_dien_thoai !== undefined) taiKhoan.so_dien_thoai = so_dien_thoai.trim();
    if (trang_thai) taiKhoan.trang_thai = trang_thai;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      taiKhoan.password = await bcrypt.hash(password.trim(), salt);
    }

    await taiKhoan.save();

    res.json({
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      user: taiKhoan.toJSON()
    });
  } catch (error) {
    console.error('Lỗi capNhatTaiKhoan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đổi trạng thái tài khoản: Khóa / Mở khóa
 */
export async function doiTrangThaiTaiKhoan(req, res) {
  try {
    const { id } = req.params;
    const taiKhoan = await NguoiDung.findOne(chuyenDoiBoLocId(id));
    if (!taiKhoan) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    // Không cho phép tự khóa tài khoản Admin đang đăng nhập
    if (req.user && req.user.id === taiKhoan.id && taiKhoan.trang_thai === 'hoat_dong') {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản của chính mình!'
      });
    }

    taiKhoan.trang_thai = taiKhoan.trang_thai === 'hoat_dong' ? 'tam_khoa' : 'hoat_dong';
    await taiKhoan.save();

    res.json({
      success: true,
      message: `Đã ${taiKhoan.trang_thai === 'hoat_dong' ? 'kích hoạt mở khóa' : 'tạm khóa'} tài khoản thành công!`,
      user: taiKhoan.toJSON()
    });
  } catch (error) {
    console.error('Lỗi doiTrangThaiTaiKhoan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Xóa vĩnh viễn tài khoản người dùng
 */
export async function xoaTaiKhoan(req, res) {
  try {
    const { id } = req.params;
    const taiKhoan = await NguoiDung.findOne(chuyenDoiBoLocId(id));
    if (!taiKhoan) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    if (req.user && req.user.id === taiKhoan.id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự xóa tài khoản của chính mình!'
      });
    }

    await NguoiDung.deleteOne(chuyenDoiBoLocId(id));

    res.json({
      success: true,
      message: 'Đã xóa tài khoản thành công!'
    });
  } catch (error) {
    console.error('Lỗi xoaTaiKhoan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default {
  layDanhSachTaiKhoan,
  taoTaiKhoanMoi,
  capNhatTaiKhoan,
  doiTrangThaiTaiKhoan,
  xoaTaiKhoan
};
