import { query, getOne, execute } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.'
      });
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    if (user.trang_thai === 'tam_khoa') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn hiện đang bị tạm khóa.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    const token = generateToken(user);
    const { password: _, ...userInfo } = user;

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'nhan_vien', so_dien_thoai } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.'
      });
    }

    const existing = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await execute(`
      INSERT INTO users (name, email, password, role, so_dien_thoai, trang_thai)
      VALUES (?, ?, ?, ?, ?, 'hoat_dong')
    `, [name, email, hashedPassword, role, so_dien_thoai || null]);

    const newUser = await getOne('SELECT id, name, email, role, so_dien_thoai, trang_thai FROM users WHERE id = ?', [result.insertId]);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Lỗi register:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await getOne('SELECT id, name, email, role, so_dien_thoai, trang_thai FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Lỗi getMe:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function getDemoAccounts(req, res) {
  try {
    const users = await query('SELECT id, name, email, role FROM users LIMIT 10');
    res.json({
      success: true,
      accounts: users.map(u => ({ ...u, passwordHint: '123456' }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy tài khoản demo.' });
  }
}
