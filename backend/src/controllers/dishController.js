import { query, getOne, execute } from '../config/db.js';

// Lấy danh sách loại món
export async function getCategories(req, res) {
  try {
    const categories = await query('SELECT * FROM loai_mon ORDER BY id ASC');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy danh sách món ăn (có lọc theo category, tìm kiếm, trạng thái)
export async function getDishes(req, res) {
  try {
    const { category_id, search, status } = req.query;
    let sql = `
      SELECT m.*, l.ten_loai, l.ma_loai 
      FROM mon_an m 
      LEFT JOIN loai_mon l ON m.loai_mon_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id && category_id !== 'all') {
      sql += ' AND m.loai_mon_id = ?';
      params.push(category_id);
    }

    if (status) {
      sql += ' AND m.trang_thai = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (m.ten_mon LIKE ? OR m.mo_ta LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY m.id DESC';

    const dishes = await query(sql, params);
    res.json({ success: true, dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy chi tiết món ăn kèm công thức định lượng (BOM)
export async function getDishById(req, res) {
  try {
    const { id } = req.params;
    const dish = await getOne(`
      SELECT m.*, l.ten_loai, l.ma_loai 
      FROM mon_an m 
      LEFT JOIN loai_mon l ON m.loai_mon_id = l.id
      WHERE m.id = ?
    `, [id]);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn.' });
    }

    const bom = await query(`
      SELECT b.*, n.ten_nguyen_lieu, n.so_luong_ton, n.don_vi_tinh as dvt_kho
      FROM mon_an_nguyen_lieu b
      JOIN nguyen_lieu n ON b.nguyen_lieu_id = n.id
      WHERE b.mon_an_id = ?
    `, [id]);

    res.json({ success: true, dish, bom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Thêm mới món ăn
export async function createDish(req, res) {
  try {
    const { ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai = 'con_hang', bom = [] } = req.body;

    if (!ten_mon || gia === undefined) {
      return res.status(400).json({ success: false, message: 'Tên món và giá là bắt buộc.' });
    }

    const result = await execute(`
      INSERT INTO mon_an (ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ten_mon, loai_mon_id || null, gia, mo_ta || '', hinh_anh || '', trang_thai]);

    const dishId = result.insertId;

    // Lưu định lượng BOM nếu có
    if (Array.isArray(bom) && bom.length > 0) {
      for (const item of bom) {
        if (item.nguyen_lieu_id && item.so_luong_can) {
          await execute(`
            INSERT INTO mon_an_nguyen_lieu (mon_an_id, nguyen_lieu_id, so_luong_can, don_vi_tinh)
            VALUES (?, ?, ?, ?)
          `, [dishId, item.nguyen_lieu_id, item.so_luong_can, item.don_vi_tinh || 'kg']);
        }
      }
    }

    const created = await getOne('SELECT * FROM mon_an WHERE id = ?', [dishId]);
    res.status(201).json({ success: true, message: 'Thêm món ăn thành công!', dish: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Cập nhật món ăn
export async function updateDish(req, res) {
  try {
    const { id } = req.params;
    const { ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai } = req.body;

    const existing = await getOne('SELECT id FROM mon_an WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn.' });
    }

    await execute(`
      UPDATE mon_an 
      SET ten_mon = COALESCE(?, ten_mon),
          loai_mon_id = COALESCE(?, loai_mon_id),
          gia = COALESCE(?, gia),
          mo_ta = COALESCE(?, mo_ta),
          hinh_anh = COALESCE(?, hinh_anh),
          trang_thai = COALESCE(?, trang_thai),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai, id]);

    const updated = await getOne('SELECT * FROM mon_an WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật món ăn thành công!', dish: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Xóa món ăn
export async function deleteDish(req, res) {
  try {
    const { id } = req.params;
    await execute('DELETE FROM mon_an WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa món ăn thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
