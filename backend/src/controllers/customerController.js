import { query, getOne, execute } from '../config/db.js';

// Lấy danh sách khách hàng thân thiết
export async function getCustomers(req, res) {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM khach_hang WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (ho_ten LIKE ? OR so_dien_thoai LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY diem_tich_luy DESC';
    const customers = await query(sql, params);
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Tạo mới khách hàng
export async function createCustomer(req, res) {
  try {
    const { ho_ten, so_dien_thoai, email } = req.body;
    if (!ho_ten || !so_dien_thoai) {
      return res.status(400).json({ success: false, message: 'Họ tên và số điện thoại là bắt buộc.' });
    }

    const existing = await getOne('SELECT id FROM khach_hang WHERE so_dien_thoai = ?', [so_dien_thoai]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
    }

    const result = await execute(`
      INSERT INTO khach_hang (ho_ten, so_dien_thoai, email, diem_tich_luy, hang_thanh_vien, tong_chi_tieu)
      VALUES (?, ?, ?, 0, 'Dong', 0)
    `, [ho_ten, so_dien_thoai, email || '']);

    const created = await getOne('SELECT * FROM khach_hang WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Thêm khách hàng thành công!', customer: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
