import { query, getOne, execute } from '../config/db.js';

// Lấy danh sách nguyên liệu kèm cờ cảnh báo dưới định mức
export async function getIngredients(req, res) {
  try {
    const { alert_only, search } = req.query;
    let sql = 'SELECT *, (so_luong_ton <= dinh_muc_toi_thieu) as is_low_stock FROM nguyen_lieu WHERE 1=1';
    const params = [];

    if (alert_only === 'true') {
      sql += ' AND so_luong_ton <= dinh_muc_toi_thieu';
    }

    if (search) {
      sql += ' AND ten_nguyen_lieu LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY is_low_stock DESC, so_luong_ton ASC';

    const ingredients = await query(sql, params);
    res.json({ success: true, ingredients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Cập nhật số lượng tồn kho hoặc nhập kho
export async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { amount, action = 'add' } = req.body; // action: 'add' | 'set'

    const item = await getOne('SELECT * FROM nguyen_lieu WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nguyên liệu.' });
    }

    let newStock = item.so_luong_ton;
    if (action === 'add') {
      newStock += Number(amount) || 0;
    } else {
      newStock = Number(amount) || 0;
    }

    newStock = Math.max(0, newStock);

    await execute(`
      UPDATE nguyen_lieu 
      SET so_luong_ton = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [newStock, id]);

    const updated = await getOne('SELECT *, (so_luong_ton <= dinh_muc_toi_thieu) as is_low_stock FROM nguyen_lieu WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật kho thành công!', ingredient: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Thêm nguyên liệu mới
export async function createIngredient(req, res) {
  try {
    const { ten_nguyen_lieu, don_vi_tinh = 'kg', so_luong_ton = 0, gia_nhap_trung_binh = 0, dinh_muc_toi_thieu = 5 } = req.body;

    if (!ten_nguyen_lieu) {
      return res.status(400).json({ success: false, message: 'Tên nguyên liệu là bắt buộc.' });
    }

    const result = await execute(`
      INSERT INTO nguyen_lieu (ten_nguyen_lieu, don_vi_tinh, so_luong_ton, gia_nhap_trung_binh, dinh_muc_toi_thieu)
      VALUES (?, ?, ?, ?, ?)
    `, [ten_nguyen_lieu, don_vi_tinh, so_luong_ton, gia_nhap_trung_binh, dinh_muc_toi_thieu]);

    const created = await getOne('SELECT * FROM nguyen_lieu WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Thêm nguyên liệu thành công!', ingredient: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy danh sách nhà cung cấp
export async function getSuppliers(req, res) {
  try {
    const suppliers = await query('SELECT * FROM nha_cung_cap ORDER BY id ASC');
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
