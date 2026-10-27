/**
 * @file xacThucController.js
 * @description Tầng xử lý nghiệp vụ Xác thực & Phân quyền người dùng (Authentication Controller).
 * Chịu trách nhiệm:
 * 1. dangNhap (login): Kiểm tra thông tin tài khoản, đối soát mật khẩu đã băm qua bcrypt.compare, cấp phát mã JWT token.
 * 2. dangKy (register): Kiểm tra email trùng lặp, băm mật khẩu với 10 vòng muối Salt, sinh ID tự tăng và tạo tài khoản mới.
 * 3. layThongTinCaNhan (getMe): Truy xuất hồ sơ tài khoản hiện tại từ token giải mã req.user.
 * 4. layTaiKhoanDemo (getDemoAccounts): Cung cấp danh sách tài khoản mẫu phục vụ kiểm thử nhanh (1-Click Login).
 * @module controllers/xacThucController
 * @author Nguyễn Hoàng Hưng
 */

import bcrypt from 'bcryptjs';
import { NguoiDung, layMaSoTiepTheo } from '../models/moHinhDuLieu.js';
import { taoMaToken } from '../config/cauHinhJWT.js';
import { chuyenDoiBoLocId } from '../utils/taoMaTuTang.js';

/**
 * Xử lý đăng nhập hệ thống
 * @function dangNhap
 * @param {Object} req - Express Request (req.body: { email, password })
 * @param {Object} res - Express Response
 */
export async function dangNhap(req, res) {
  try {
    const { email, password } = req.body;

    // Kiểm tra tính hợp lệ của tham số đầu vào
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.'
      });
    }

    // Tìm kiếm người dùng theo email trong MongoDB
    const nguoiDung = await NguoiDung.findOne({ email: email.toLowerCase().trim() });
    if (!nguoiDung) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    // Kiểm tra trạng thái khóa tài khoản
    if (nguoiDung.trang_thai === 'tam_khoa') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên.'
      });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa Bcrypt trong CSDL
    const dungMatKhau = await bcrypt.compare(password, nguoiDung.password);
    if (!dungMatKhau) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    // Phát hành chuỗi JWT Token
    const token = taoMaToken(nguoiDung);
    const thongTinNguoiDung = nguoiDung.toJSON();

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: thongTinNguoiDung
    });
  } catch (error) {
    console.error('Lỗi dangNhap:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ trong quá trình đăng nhập.' });
  }
}

/**
 * Xử lý đăng ký tài khoản nhân viên mới
 * @function dangKy
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function dangKy(req, res) {
  try {
    const { name, email, password, role = 'khach_hang', so_dien_thoai = '' } = req.body;

    const tenSach = (name || '').trim();
    const emailSach = (email || '').toLowerCase().trim();
    const sdtSach = (so_dien_thoai || '').trim();

    // Kiểm tra Họ và Tên: Chỉ gồm chữ cái tiếng Việt và khoảng trắng, 2 - 50 ký tự
    const regexTen = /^[a-zA-ZÀ-ỹ\s]{2,50}$/u;
    if (!tenSach || !regexTen.test(tenSach)) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái tiếng Việt và độ dài từ 2 đến 50 ký tự.'
      });
    }

    // Kiểm tra cấu trúc Email hợp lệ
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailSach || !regexEmail.test(emailSach)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không đúng định dạng chuẩn (ví dụ: khachhang@email.com).'
      });
    }

    // Kiểm tra Số điện thoại: Chuẩn di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
    const regexSdt = /^(0[35789])[0-9]{8}$/;
    if (!sdtSach || !regexSdt.test(sdtSach)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại phải là số di động Việt Nam hợp lệ gồm 10 chữ số (đầu số 03, 05, 07, 08, 09).'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.'
      });
    }

    // Kiểm tra email đã tồn tại hay chưa
    const daTonTai = await NguoiDung.findOne({ email: emailSach });
    if (daTonTai) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email này đã được đăng ký trên hệ thống.'
      });
    }

    // Sinh muối và băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const matKhauDaBam = await bcrypt.hash(password, salt);
    const maSoMoi = await layMaSoTiepTheo('user_id');

    // Luôn tạo tài khoản đăng ký công khai với vai trò Khách Hàng (tài khoản nhân viên/admin do Quản lý tạo)
    const nguoiDungMoi = await NguoiDung.create({
      id: maSoMoi,
      name: tenSach,
      email: emailSach,
      password: matKhauDaBam,
      role: 'khach_hang',
      so_dien_thoai: sdtSach,
      trang_thai: 'hoat_dong'
    });

    const token = taoMaToken(nguoiDungMoi);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: nguoiDungMoi.toJSON()
    });
  } catch (error) {
    console.error('Lỗi dangKy:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ trong quá trình đăng ký.' });
  }
}

/**
 * Lấy thông tin hồ sơ của người dùng hiện tại đang đăng nhập
 * @function layThongTinCaNhan
 * @param {Object} req - Express Request (req.user từ token)
 * @param {Object} res - Express Response
 */
export async function layThongTinCaNhan(req, res) {
  try {
    const nguoiDung = await NguoiDung.findOne(chuyenDoiBoLocId(req.user.id)).select('-password');

    if (!nguoiDung) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản.' });
    }
    res.json({ success: true, user: nguoiDung.toJSON() });
  } catch (error) {
    console.error('Lỗi layThongTinCaNhan:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Lấy danh sách tài khoản mẫu phục vụ demo kiểm thử 1-Click
 * @function layTaiKhoanDemo
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layTaiKhoanDemo(req, res) {
  try {
    const danhSach = await NguoiDung.find({}).limit(10).select('id name email role');
    res.json({
      success: true,
      accounts: danhSach.map(u => ({ ...u.toJSON(), passwordHint: '123456' }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tài khoản demo.' });
  }
}

// Bí danh tương thích
export const login = dangNhap;
export const register = dangKy;
export const getMe = layThongTinCaNhan;
export const getDemoAccounts = layTaiKhoanDemo;

export default {
  dangNhap,
  dangKy,
  layThongTinCaNhan,
  layTaiKhoanDemo,
  login,
  register,
  getMe,
  getDemoAccounts
};
