import { query, getOne, execute } from '../config/db.js';
import { emitTableUpdate } from '../utils/socket.js';

// Lấy danh sách bàn ăn kèm số món đang chờ/đang phục vụ
export async function getTables(req, res) {
  try {
    const { khu_vuc } = req.query;
    let sql = 'SELECT * FROM ban WHERE 1=1';
    const params = [];

    if (khu_vuc && khu_vuc !== 'all') {
      sql += ' AND khu_vuc = ?';
      params.push(khu_vuc);
    }

    sql += ' ORDER BY so_ban ASC';
    const tables = await query(sql, params);

    // Lấy thêm tổng tiền tạm tính và số món chưa thanh toán cho mỗi bàn
    const activeOrders = await query(`
      SELECT ban_id, SUM(tong_tien) as tam_tinh, COUNT(id) as so_mon
      FROM dat_mon
      WHERE phuong_thuc_thanh_toan = 'chua_thanh_toan' AND trang_thai != 'da_huy'
      GROUP BY ban_id
    `);

    const orderMap = {};
    activeOrders.forEach(o => {
      orderMap[o.ban_id] = {
        tam_tinh: o.tam_tinh || 0,
        so_mon: o.so_mon || 0
      };
    });

    const result = tables.map(t => ({
      ...t,
      tam_tinh: orderMap[t.id]?.tam_tinh || 0,
      so_mon: orderMap[t.id]?.so_mon || 0
    }));

    res.json({ success: true, tables: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Cập nhật trạng thái bàn (trống, có khách, đã đặt...)
export async function updateTableStatus(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai, so_luong_khach, yeu_cau_thanh_toan } = req.body;

    await execute(`
      UPDATE ban
      SET trang_thai = COALESCE(?, trang_thai),
          so_luong_khach = COALESCE(?, so_luong_khach),
          yeu_cau_thanh_toan = COALESCE(?, yeu_cau_thanh_toan),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [trang_thai, so_luong_khach, yeu_cau_thanh_toan, id]);

    const updated = await getOne('SELECT * FROM ban WHERE id = ?', [id]);
    emitTableUpdate(updated);

    res.json({ success: true, message: 'Cập nhật trạng thái bàn thành công!', table: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Thêm bàn mới
export async function createTable(req, res) {
  try {
    const { so_ban, suc_chua = 4, khu_vuc = 'Tầng 1 - Sảnh Chính' } = req.body;

    const existing = await getOne('SELECT id FROM ban WHERE so_ban = ?', [so_ban]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Bàn số ${so_ban} đã tồn tại.` });
    }

    const result = await execute(`
      INSERT INTO ban (so_ban, suc_chua, trang_thai, khu_vuc)
      VALUES (?, ?, 'trong', ?)
    `, [so_ban, suc_chua, khu_vuc]);

    const created = await getOne('SELECT * FROM ban WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Thêm bàn mới thành công!', table: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
